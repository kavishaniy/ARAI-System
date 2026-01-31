from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Header
from typing import Optional
import os
import uuid
from datetime import datetime
import shutil
from pathlib import Path
import numpy as np
import logging

from app.ai_modules.comprehensive_wcag_analyzer import ComprehensiveWCAGAnalyzer
from app.ai_modules.comprehensive_readability_analyzer import ComprehensiveReadabilityAnalyzer
from app.ai_modules.comprehensive_attention_analyzer import ComprehensiveAttentionAnalyzer
from app.ai_modules.report_generator import ComprehensiveReportGenerator
from app.core.database import (
    upload_design_to_storage,
    save_analysis_to_db,
    get_user_analyses,
    get_analysis_by_id,
    delete_analysis,
    update_analysis_status,
    supabase
)

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize comprehensive analyzers
wcag_analyzer = ComprehensiveWCAGAnalyzer()  # FR-009 to FR-012
readability_analyzer = ComprehensiveReadabilityAnalyzer()  # FR-013 to FR-016

# Path to saliency model (will be created during training)
MODEL_PATH = Path(__file__).parent.parent.parent / "models" / "saliency_model.pth"
attention_analyzer = ComprehensiveAttentionAnalyzer(str(MODEL_PATH))  # FR-017 to FR-020

# Report generator for FR-021 to FR-027
report_generator = ComprehensiveReportGenerator()

# Upload directory
UPLOAD_DIR = Path(__file__).parent.parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


async def get_current_user(authorization: Optional[str] = Header(None)):
    """
    Extract and verify user from JWT token
    """
    if not authorization:
        logger.error("❌ No authorization header")
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        # Extract token from "Bearer <token>"
        if not authorization.startswith("Bearer "):
            logger.error("❌ Invalid authorization format")
            raise HTTPException(status_code=401, detail="Invalid authorization format")
        
        token = authorization.replace("Bearer ", "")
        logger.info(f"🔑 Token received: {token[:20]}...")
        
        # Verify token with Supabase
        try:
            user_response = supabase.auth.get_user(token)
            logger.info(f"✅ User response: {user_response}")
            
            if not user_response or not user_response.user:
                logger.error("❌ No user in response")
                raise HTTPException(status_code=401, detail="Invalid or expired token")
            
            logger.info(f"✅ Authenticated user: {user_response.user.id}")
            return user_response.user
            
        except Exception as supabase_error:
            logger.error(f"❌ Supabase auth error: {str(supabase_error)}")
            raise HTTPException(status_code=401, detail=f"Token verification failed: {str(supabase_error)}")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Authentication error: {str(e)}")
        raise HTTPException(status_code=401, detail="Authentication failed")



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
    design_name: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    """
    Upload a design file for comprehensive AI-powered analysis
    Analyzes: Accessibility (WCAG 2.1), Readability, and Visual Attention
    Requires authentication
    """
    try:
        logger.info(f"📤 Upload request from user: {current_user.id}")
        
        # Validate file type
        allowed_extensions = {'.png', '.jpg', '.jpeg', '.webp'}
        file_ext = os.path.splitext(file.filename)[1].lower()
        
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed types: {', '.join(allowed_extensions)}"
            )
        
        # Validate file size (10MB max)
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Reset to beginning
        
        if file_size > 10 * 1024 * 1024:  # 10MB
            raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")
        
        # Generate unique analysis ID
        analysis_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        
        # Create analysis directory (local temporary storage)
        analysis_dir = UPLOAD_DIR / analysis_id
        analysis_dir.mkdir(exist_ok=True)
        
        # Save uploaded file locally first
        local_file_path = analysis_dir / f"original{file_ext}"
        with open(local_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        logger.info(f"💾 File saved locally: {local_file_path}")
        
        # Upload to Supabase Storage
        try:
            storage_path = await upload_design_to_storage(
                user_id=str(current_user.id),
                file_path=str(local_file_path),
                file_name=file.filename
            )
            logger.info(f"☁️ File uploaded to Supabase Storage: {storage_path}")
        except Exception as storage_error:
            logger.warning(f"⚠️ Storage upload failed (continuing with local): {storage_error}")
            storage_path = str(local_file_path)
        # Run all analyses
        logger.info(f"🔍 Starting comprehensive analysis for {file.filename}...")
        
        # 1. Comprehensive WCAG 2.1 Accessibility Analysis (FR-009 to FR-012)
        logger.info("♿ Running comprehensive WCAG 2.1 analysis (Contrast, Color Blindness, Alt Text)...")
        accessibility_results = wcag_analyzer.analyze_design(str(local_file_path))
        
        # 2. Comprehensive Readability Analysis (FR-013 to FR-016)
        logger.info("📖 Running readability analysis (Flesch-Kincaid, Vocabulary, Inclusive Language, Typography)...")
        readability_results = readability_analyzer.analyze_design(str(local_file_path))
        
        # 3. Comprehensive Attention Analysis (FR-017 to FR-020)
        logger.info("👁️ Running attention analysis (Saliency, Visual Hierarchy, Cognitive Load)...")
        attention_results = attention_analyzer.analyze_design(str(local_file_path))
        
        # Compile comprehensive results
        analysis_results = {
            "accessibility": accessibility_results,
            "readability": readability_results,
            "attention": attention_results
        }
        
        # 4. Generate Comprehensive Report (FR-021 to FR-027)
        logger.info("📊 Generating comprehensive report with ARAI score, annotations, and exports...")
        comprehensive_report = report_generator.generate_comprehensive_report(
            analysis_results,
            str(local_file_path)
        )
        
        # Calculate overall ARAI score (FR-021)
        arai_score = comprehensive_report["arai_score"]["overall"]
        
        # Compile final results
        final_results = {
            "analysis_id": analysis_id,
            "design_name": design_name or file.filename,
            "filename": file.filename,
            "timestamp": timestamp,
            
            # FR-021: ARAI Score
            "arai_score": round(arai_score, 2),
            "arai_breakdown": comprehensive_report["arai_score"],
            "overall_grade": comprehensive_report["grade"],
            
            # Individual analysis results
            "accessibility": accessibility_results,
            "readability": readability_results,
            "attention": attention_results,
            
            # FR-022: Annotated image
            "annotated_image": comprehensive_report["annotated_image"],
            
            # FR-023 & FR-024: Comprehensive issue list with explainable AI
            "issues": comprehensive_report["issues"],
            "issue_summary": comprehensive_report["issue_summary"],
            
            # FR-025: Educational content
            "education": comprehensive_report["education"],
            
            # Recommendations
            "recommendations": comprehensive_report["recommendations"],
            
            "status": "completed",
            "metadata": comprehensive_report["metadata"]
        }
        
        # Convert NumPy types to native Python types for JSON serialization
        final_results = convert_to_native_types(final_results)
        
        # Save to Supabase database
        try:
            await save_analysis_to_db(
                user_id=str(current_user.id),
                analysis_id=analysis_id,
                design_name=design_name or file.filename,
                filename=file.filename,
                file_path=storage_path,
                results=final_results
            )
            logger.info(f"💾 Analysis saved to database")
        except Exception as db_error:
            logger.error(f"❌ Database save failed: {db_error}")
            # Continue even if DB save fails - return results anyway
        
        # Save results to JSON (local backup)
        import json
        results_path = analysis_dir / "results.json"
        with open(results_path, "w") as f:
            json.dump(final_results, f, indent=2)
        
        logger.info(f"✅ Analysis completed. ARAI Score: {arai_score}")
        logger.info(f"📊 Accessibility: {accessibility_results['score']}, Readability: {readability_results['score']}, Attention: {attention_results['score']}")
        
        return final_results
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error during analysis: {str(e)}")
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
async def get_analysis_results(
    analysis_id: str,
    current_user = Depends(get_current_user)
):
    """
    Get analysis results for a specific design
    Requires authentication
    """
    try:
        # Try to get from database first
        analysis = await get_analysis_by_id(analysis_id, str(current_user.id))
        
        if analysis:
            return analysis.get("results", analysis)
        
        # Fallback to local file if not in database
        analysis_dir = UPLOAD_DIR / analysis_id
        results_path = analysis_dir / "results.json"
        
        if not results_path.exists():
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        import json
        with open(results_path, "r") as f:
            results = json.load(f)
        
        return results
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching results: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_analysis_history(
    limit: int = 50,
    current_user = Depends(get_current_user)
):
    """
    Get history of all analyses for the current user
    Requires authentication
    """
    try:
        # Get from database
        analyses = await get_user_analyses(str(current_user.id), limit)
        
        # Format for frontend
        history = []
        for analysis in analyses:
            history.append({
                "analysis_id": analysis["id"],
                "design_name": analysis["design_name"],
                "filename": analysis.get("filename", ""),
                "timestamp": analysis["created_at"],
                "arai_score": analysis.get("arai_score"),
                "overall_grade": analysis.get("overall_grade"),
                "conformance_level": analysis.get("conformance_level"),
                "status": analysis.get("status", "completed")
            })
        
        return {"analyses": history, "total": len(history)}
        
    except Exception as e:
        logger.error(f"Error fetching history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/results/{analysis_id}")
async def delete_analysis_endpoint(
    analysis_id: str,
    current_user = Depends(get_current_user)
):
    """
    Delete an analysis by ID
    Requires authentication
    """
    try:
        # Delete from database
        success = await delete_analysis(analysis_id, str(current_user.id))
        
        if not success:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        # Delete local files if they exist
        analysis_dir = UPLOAD_DIR / analysis_id
        if analysis_dir.exists():
            shutil.rmtree(analysis_dir)
        
        return {
            "message": "Analysis deleted successfully",
            "analysis_id": analysis_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export/pdf/{analysis_id}")
async def export_pdf(
    analysis_id: str,
    current_user = Depends(get_current_user)
):
    """
    FR-026: Export comprehensive analysis report as PDF
    Requires authentication
    """
    try:
        # Get analysis results
        analysis = await get_analysis_by_id(analysis_id, str(current_user.id))
        
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        results = analysis.get("results", analysis)
        
        # Generate PDF
        analysis_dir = UPLOAD_DIR / analysis_id
        analysis_dir.mkdir(exist_ok=True)
        
        pdf_path = analysis_dir / f"report_{analysis_id}.pdf"
        
        # Use report generator to create PDF
        report_generator.export_to_pdf(results, str(pdf_path))
        
        # Return file for download
        from fastapi.responses import FileResponse
        return FileResponse(
            path=str(pdf_path),
            filename=f"ARAI_Report_{results.get('design_name', 'analysis')}.pdf",
            media_type="application/pdf"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")


@router.get("/export/csv/{analysis_id}")
async def export_csv(
    analysis_id: str,
    current_user = Depends(get_current_user)
):
    """
    FR-027: Export issue data as CSV
    Requires authentication
    """
    try:
        # Get analysis results
        analysis = await get_analysis_by_id(analysis_id, str(current_user.id))
        
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        results = analysis.get("results", analysis)
        
        # Generate CSV
        analysis_dir = UPLOAD_DIR / analysis_id
        analysis_dir.mkdir(exist_ok=True)
        
        csv_path = analysis_dir / f"issues_{analysis_id}.csv"
        
        # Use report generator to create CSV
        report_generator.export_to_csv(results, str(csv_path))
        
        # Return file for download
        from fastapi.responses import FileResponse
        return FileResponse(
            path=str(csv_path),
            filename=f"ARAI_Issues_{results.get('design_name', 'analysis')}.csv",
            media_type="text/csv"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating CSV: {str(e)}")
        raise HTTPException(status_code=500, detail=f"CSV generation failed: {str(e)}")
