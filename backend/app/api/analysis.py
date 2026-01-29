from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from typing import Optional
import os
import uuid
from datetime import datetime
import shutil
from pathlib import Path
import numpy as np

from app.ai_modules.accessibility_analyzer import AccessibilityAnalyzer
from app.ai_modules.wcag_analyzer import WCAGAnalyzer
from app.ai_modules.readability_analyzer import ReadabilityAnalyzer
from app.ai_modules.attention_analyzer import AttentionAnalyzer

router = APIRouter()

# Initialize analyzers
accessibility_analyzer = AccessibilityAnalyzer()
wcag_analyzer = WCAGAnalyzer()  # Comprehensive WCAG 2.1 analyzer
readability_analyzer = ReadabilityAnalyzer()

# Path to saliency model (will be created during training)
MODEL_PATH = Path(__file__).parent.parent.parent / "models" / "saliency_model.pth"
attention_analyzer = AttentionAnalyzer(str(MODEL_PATH))

# Upload directory
UPLOAD_DIR = Path(__file__).parent.parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


def convert_to_native_types(obj):
    """
    Recursively convert NumPy types to native Python types for JSON serialization
    """
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_to_native_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_to_native_types(item) for item in obj]
    else:
        return obj


def calculate_arai_score(accessibility_score: float, readability_score: float, attention_score: float) -> float:
    """
    Calculate the Accessibility Readability Attention Index (ARAI)
    Weighted average: Accessibility (40%), Readability (30%), Attention (30%)
    """
    return (accessibility_score * 0.4) + (readability_score * 0.3) + (attention_score * 0.3)


@router.post("/upload")
async def upload_design(
    file: UploadFile = File(...),
    design_name: Optional[str] = None
):
    """
    Upload a design file for comprehensive AI-powered analysis
    Analyzes: Accessibility (WCAG 2.1), Readability, and Visual Attention
    """
    try:
        # Validate file type
        allowed_extensions = {'.png', '.jpg', '.jpeg', '.webp'}
        file_ext = os.path.splitext(file.filename)[1].lower()
        
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed types: {', '.join(allowed_extensions)}"
            )
        
        # Generate unique analysis ID
        analysis_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        
        # Create analysis directory
        analysis_dir = UPLOAD_DIR / analysis_id
        analysis_dir.mkdir(exist_ok=True)
        
        # Save uploaded file
        file_path = analysis_dir / f"original{file_ext}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Run all analyses
        print(f"Starting comprehensive analysis for {file.filename}...")
        
        # 1. Comprehensive WCAG 2.1 Accessibility Analysis
        print("Running comprehensive WCAG 2.1 analysis...")
        accessibility_results = wcag_analyzer.analyze_design(str(file_path))
        
        # 2. Readability Analysis
        print("Running readability analysis...")
        readability_results = readability_analyzer.analyze_design(str(file_path))
        
        # 3. Attention Analysis
        print("Running attention analysis...")
        attention_results = attention_analyzer.analyze_design(str(file_path))
        
        # Calculate overall ARAI score
        arai_score = calculate_arai_score(
            accessibility_results["score"],
            readability_results["score"],
            attention_results["score"]
        )
        
        # Compile comprehensive results
        analysis_results = {
            "analysis_id": analysis_id,
            "design_name": design_name or file.filename,
            "filename": file.filename,
            "timestamp": timestamp,
            "arai_score": round(arai_score, 2),
            "accessibility": accessibility_results,
            "readability": readability_results,
            "attention": attention_results,
            "overall_grade": _get_grade(arai_score),
            "status": "completed"
        }
        
        # Convert NumPy types to native Python types for JSON serialization
        analysis_results = convert_to_native_types(analysis_results)
        
        # Save results to JSON
        import json
        results_path = analysis_dir / "results.json"
        with open(results_path, "w") as f:
            json.dump(analysis_results, f, indent=2)
        
        print(f"Analysis completed. ARAI Score: {arai_score}")
        
        return analysis_results
        
    except Exception as e:
        print(f"Error during analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


def _get_grade(score: float) -> str:
    """Convert numerical score to letter grade"""
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 70:
        return "C"
    elif score >= 60:
        return "D"
    else:
        return "F"


@router.get("/results/{analysis_id}")
async def get_analysis_results(analysis_id: str):
    """
    Get analysis results for a specific design
    """
    try:
        analysis_dir = UPLOAD_DIR / analysis_id
        results_path = analysis_dir / "results.json"
        
        if not results_path.exists():
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        import json
        with open(results_path, "r") as f:
            results = json.load(f)
        
        return results
        
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Analysis not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_analysis_history():
    """
    Get history of all analyses
    """
    try:
        analyses = []
        
        for analysis_dir in UPLOAD_DIR.iterdir():
            if analysis_dir.is_dir():
                results_path = analysis_dir / "results.json"
                if results_path.exists():
                    import json
                    with open(results_path, "r") as f:
                        data = json.load(f)
                        analyses.append({
                            "analysis_id": data["analysis_id"],
                            "design_name": data["design_name"],
                            "timestamp": data["timestamp"],
                            "arai_score": data["arai_score"],
                            "overall_grade": data["overall_grade"]
                        })
        
        # Sort by timestamp (newest first)
        analyses.sort(key=lambda x: x["timestamp"], reverse=True)
        
        return {"analyses": analyses}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/results/{analysis_id}")
async def delete_analysis(analysis_id: str):
    """
    Delete an analysis by ID
    """
    try:
        analysis_dir = UPLOAD_DIR / analysis_id
        
        if not analysis_dir.exists():
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        # Delete the entire analysis directory
        shutil.rmtree(analysis_dir)
        
        return {
            "message": "Analysis deleted successfully",
            "analysis_id": analysis_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
