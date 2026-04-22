from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Header, Body, Form
from typing import Optional, Dict, Any
import asyncio
import os
import uuid
from app.core.config import settings
from datetime import datetime
import shutil
from pathlib import Path
import numpy as np
import logging
import gc
from pydantic import BaseModel


# Pydantic models for request bodies
class ValidateURLRequest(BaseModel):
    url: str


# Check for LITE_MODE (skips PyTorch to save memory on free tier hosting)
LITE_MODE = os.getenv("LITE_MODE", "false").lower() == "true"
if LITE_MODE:
    logging.info("🚀 Running in LITE_MODE - PyTorch-based analysis disabled to save memory")

# Lazy imports for memory optimization
SimplifiedWCAGAnalyzer = None
SimplifiedReadabilityAnalyzer = None
SimplifiedAttentionAnalyzer = None


def _import_wcag_analyzer():
    global SimplifiedWCAGAnalyzer
    if SimplifiedWCAGAnalyzer is None:
        from app.ai_modules.simplified_wcag_analyzer import SimplifiedWCAGAnalyzer as _WCAG
        SimplifiedWCAGAnalyzer = _WCAG
    return SimplifiedWCAGAnalyzer


def _import_readability_analyzer():
    global SimplifiedReadabilityAnalyzer
    if SimplifiedReadabilityAnalyzer is None:
        from app.ai_modules.simplified_readability_analyzer import SimplifiedReadabilityAnalyzer as _Read
        SimplifiedReadabilityAnalyzer = _Read
    return SimplifiedReadabilityAnalyzer


def _import_attention_analyzer():
    global SimplifiedAttentionAnalyzer
    if SimplifiedAttentionAnalyzer is None:
        from app.ai_modules.simplified_attention_analyzer import SimplifiedAttentionAnalyzer as _Attn
        SimplifiedAttentionAnalyzer = _Attn
    return SimplifiedAttentionAnalyzer


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

# Initialize analyzers as None - will be lazy loaded when needed
wcag_analyzer = None
readability_analyzer = None
attention_analyzer = None

# Path to saliency model (will be created during training)
MODEL_PATH = Path(__file__).parent.parent.parent / "models" / "saliency_model.pth"

# Upload directory
UPLOAD_DIR = Path(__file__).parent.parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


def get_wcag_analyzer():
    """Lazy load WCAG analyzer with memory cleanup"""
    global wcag_analyzer
    if wcag_analyzer is None:
        logger.info("🔄 Lazy loading WCAG analyzer...")
        gc.collect()  # Free memory before loading
        WCAGClass = _import_wcag_analyzer()
        wcag_analyzer = WCAGClass()
    return wcag_analyzer


def get_readability_analyzer():
    """Lazy load readability analyzer with memory cleanup"""
    global readability_analyzer
    if readability_analyzer is None:
        logger.info("🔄 Lazy loading readability analyzer...")
        gc.collect()  # Free memory before loading
        ReadClass = _import_readability_analyzer()
        readability_analyzer = ReadClass()
    return readability_analyzer


def get_attention_analyzer():
    """Lazy load attention analyzer with memory cleanup"""
    global attention_analyzer
    if attention_analyzer is None:
        logger.info("🔄 Lazy loading attention analyzer...")
        gc.collect()  # Free memory before loading
        AttnClass = _import_attention_analyzer()
        attention_analyzer = AttnClass()
    return attention_analyzer


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
    design_name: Optional[str] = Form(None),
    project_id: Optional[str] = Form(None),
    team_id: Optional[str] = Form(None),
    current_user = Depends(get_current_user)
):
    """
    Upload a design file for comprehensive AI-powered analysis
    Analyzes: Accessibility (WCAG 2.1), Readability, and Visual Attention
    Requires authentication
    """
    try:
        logger.info(f"📤 Upload request from user: {current_user.id}")
        
        # Normalize project_id - convert "None" string to None
        if project_id == "None" or project_id == "null" or project_id == "":
            project_id = None

        if team_id == "None" or team_id == "null" or team_id == "":
            team_id = None
            
        logger.info(f"📋 Project ID: {project_id}")
        logger.info(f"👥 Team ID: {team_id}")
        logger.info(f"🏷️ Design name: {design_name}")
        
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
        # Run all analyses with memory management
        logger.info(f"🔍 Starting simplified analysis for {file.filename}...")

        analysis_errors = []

        # 1. Simplified WCAG 2.1 Accessibility Analysis (4 key areas)
        logger.info("♿ Running accessibility analysis (Color Contrast, Text Size, Color Independence, Touch Targets)...")
        try:
            accessibility_results = get_wcag_analyzer().analyze_design(str(local_file_path))
            gc.collect()  # Free memory after analysis
        except MemoryError as e:
            logger.error(f"❌ Memory error in accessibility analysis: {e}")
            analysis_errors.append("accessibility")
            accessibility_results = {"score": 50, "issues": [], "error": "Memory limit exceeded - partial analysis"}
        except Exception as e:
            logger.error(f"❌ Error in accessibility analysis: {e}")
            analysis_errors.append("accessibility")
            accessibility_results = {"score": 50, "issues": [], "error": str(e)}

        # 2. Simplified Readability Analysis (4 key areas)
        logger.info("📖 Running readability analysis (Short Sentences, Simple Words, Text Breaks, Active Voice)...")
        try:
            readability_results = get_readability_analyzer().analyze_design(str(local_file_path))
            gc.collect()  # Free memory after analysis
        except MemoryError as e:
            logger.error(f"❌ Memory error in readability analysis: {e}")
            analysis_errors.append("readability")
            readability_results = {"score": 50, "issues": [], "error": "Memory limit exceeded - partial analysis"}
        except Exception as e:
            logger.error(f"❌ Error in readability analysis: {e}")
            analysis_errors.append("readability")
            readability_results = {"score": 50, "issues": [], "error": str(e)}

        # 3. Simplified Attention Analysis (4 key areas)
        logger.info("👁️ Running attention analysis (Visual Hierarchy, Eye Flow, Cognitive Load, Hot Spots)...")
        try:
            attention_results = get_attention_analyzer().analyze_design(str(local_file_path))
            gc.collect()  # Free memory after analysis
        except MemoryError as e:
            logger.error(f"❌ Memory error in attention analysis: {e}")
            analysis_errors.append("attention")
            attention_results = {"score": 50, "issues": [], "error": "Memory limit exceeded - partial analysis"}
        except Exception as e:
            logger.error(f"❌ Error in attention analysis: {e}")
            analysis_errors.append("attention")
            attention_results = {"score": 50, "issues": [], "error": str(e)}

        # Log any errors
        if analysis_errors:
            logger.warning(f"⚠️ Analysis completed with errors in: {', '.join(analysis_errors)}")
        
        # Calculate ARAI score
        acc_score = accessibility_results.get("score", 50)
        read_score = readability_results.get("score", 50)
        attn_score = attention_results.get("score", 50)
        
        logger.info(f"📊 Raw scores from analyzers:")
        logger.info(f"   - Accessibility: {acc_score} (type: {type(acc_score).__name__})")
        logger.info(f"   - Readability: {read_score} (type: {type(read_score).__name__})")
        logger.info(f"   - Attention: {attn_score} (type: {type(attn_score).__name__})")
        
        arai_score = (acc_score * 0.4) + (read_score * 0.3) + (attn_score * 0.3)
        logger.info(f"📊 Calculated ARAI Score: {arai_score}")
        
        # Compile all issues from all analyses
        all_issues = []
        all_issues.extend(accessibility_results.get("issues", []))
        all_issues.extend(readability_results.get("issues", []))
        all_issues.extend(attention_results.get("issues", []))
        
        # Count issues by severity
        critical = sum(1 for i in all_issues if i.get('severity') == 'critical')
        high = sum(1 for i in all_issues if i.get('severity') == 'high')
        medium = sum(1 for i in all_issues if i.get('severity') == 'medium')
        success = sum(1 for i in all_issues if i.get('severity') == 'success')
        
        # Generate preview image (base64 encoded)
        preview_image = None
        try:
            import base64 as _b64
            with open(local_file_path, "rb") as img_file:
                img_data = img_file.read()
                preview_image = f"data:image/{file_ext[1:]};base64," + _b64.b64encode(img_data).decode()
            logger.info("✅ Preview image generated")
        except Exception as preview_error:
            logger.warning(f"⚠️ Could not generate preview image: {preview_error}")
        
        # Compile final results
        final_results = {
            "analysis_id": analysis_id,
            "design_name": design_name or file.filename,
            "filename": file.filename,
            "timestamp": timestamp,
            "preview": preview_image,
            
            # ARAI Score
            "arai_score": round(arai_score, 2),
            "arai_breakdown": {
                "overall": round(arai_score, 2),
                "accessibility": round(acc_score, 2),
                "readability": round(read_score, 2),
                "attention": round(attn_score, 2)
            },
            "overall_grade": _get_grade(arai_score),
            
            # Individual analysis results
            "accessibility": accessibility_results,
            "readability": readability_results,
            "attention": attention_results,
            
            # All issues combined
            "issues": all_issues,
            "issue_summary": {
                "critical": critical,
                "high": high,
                "medium": medium,
                "passing": success
            },
            
            "status": "completed" if not analysis_errors else "partial",
            "warnings": [f"Analysis had errors in: {', '.join(analysis_errors)}"] if analysis_errors else []
        }
        
        # Convert NumPy types to native Python types for JSON serialization
        final_results = convert_to_native_types(final_results)

        # Generate visual redesign images (heatmap, annotated, enhanced)
        redesigned_images = {}
        try:
            from app.ai_modules.image_redesigner import ImageRedesigner
            logger.info("🎨 Generating visual redesign images...")
            redesigned_images = ImageRedesigner().generate(str(local_file_path), final_results)
            # Save each image as a file for future retrieval
            import base64 as _b64
            for key, data_url in redesigned_images.items():
                if data_url:
                    img_bytes = _b64.b64decode(data_url.split(",", 1)[1])
                    img_path = analysis_dir / f"{key}.jpg"
                    with open(img_path, "wb") as f:
                        f.write(img_bytes)
            logger.info("✅ Visual redesign images generated and saved")
        except Exception as redesign_error:
            logger.warning(f"⚠️ Could not generate redesign images: {redesign_error}")

        # Save to Supabase database (without large image blobs)
        history_saved = True
        history_warning = None
        try:
            logger.info(f"💾 Attempting to save analysis to database...")
            await save_analysis_to_db(
                user_id=str(current_user.id),
                analysis_id=analysis_id,
                design_name=design_name or file.filename,
                filename=file.filename,
                file_path=storage_path,
                results=final_results,
                project_id=project_id,
                team_id=team_id
            )
            logger.info(f"✅ Analysis saved to database successfully")
        except Exception as db_error:
            history_saved = False
            history_warning = "Analysis completed, but it could not be saved to team/project history."
            logger.error(f"❌ Database save failed: {db_error}")
            import traceback
            logger.error(f"📌 Full traceback: {traceback.format_exc()}")
            final_results["warnings"] = [
                *final_results.get("warnings", []),
                history_warning,
            ]

        # Save results to JSON (local backup, without images to keep file small)
        import json
        results_path = analysis_dir / "results.json"
        with open(results_path, "w") as f:
            json.dump(final_results, f, indent=2)

        logger.info(f"✅ Analysis completed. ARAI Score: {arai_score}")
        logger.info(f"📊 Accessibility: {accessibility_results['score']}, Readability: {readability_results['score']}, Attention: {attention_results['score']}")

        # Return results WITH redesigned images (images are not stored in DB)
        return {
            **final_results,
            "redesigned_images": redesigned_images,
            "saved_to_history": history_saved,
            "history_warning": history_warning,
        }
        
    except HTTPException:
        raise
    except MemoryError as e:
        logger.error(f"❌ Memory error during analysis: {str(e)}")
        gc.collect()  # Try to free memory
        raise HTTPException(
            status_code=503,
            detail="Server memory limit exceeded. The image may be too large or complex. Please try a smaller image."
        )
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
        import json as _json
        import base64 as _b64

        def _attach_images(data: dict) -> dict:
            """Read saved redesign images from disk and attach as base64."""
            aid = data.get("analysis_id") or analysis_id
            img_dir = UPLOAD_DIR / aid
            images = {}
            for key in ("heatmap", "annotated", "enhanced"):
                img_path = img_dir / f"{key}.jpg"
                if img_path.exists():
                    images[key] = "data:image/jpeg;base64," + _b64.b64encode(
                        img_path.read_bytes()
                    ).decode()
            if images:
                data = {**data, "redesigned_images": images}
            return data

        # Try to get from database first
        analysis = await get_analysis_by_id(analysis_id, str(current_user.id))

        if analysis:
            if analysis.get("results") and isinstance(analysis["results"], dict) and analysis["results"].get("arai_breakdown"):
                return _attach_images(analysis["results"])
            results_path = UPLOAD_DIR / analysis_id / "results.json"
            if results_path.exists():
                with open(results_path, "r") as f:
                    return _attach_images(_json.load(f))
            return _attach_images({
                "analysis_id": analysis.get("id"),
                "design_name": analysis.get("design_name"),
                "arai_score": analysis.get("arai_score", 0),
                "overall_grade": analysis.get("overall_grade", "N/A"),
                "arai_breakdown": {
                    "overall": analysis.get("arai_score", 0),
                    "accessibility": analysis.get("accessibility_score", 0),
                    "readability": analysis.get("readability_score", 0),
                    "attention": analysis.get("attention_score", 0),
                },
                "accessibility": {"score": analysis.get("accessibility_score", 0), "issues": []},
                "readability": {"score": analysis.get("readability_score", 0), "issues": []},
                "attention": {"score": analysis.get("attention_score", 0), "issues": []},
            })

        # Fallback to local file
        analysis_dir = UPLOAD_DIR / analysis_id
        results_path = analysis_dir / "results.json"

        if not results_path.exists():
            raise HTTPException(status_code=404, detail="Analysis not found")

        with open(results_path, "r") as f:
            results = _json.load(f)

        return _attach_images(results)
        
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


@router.get("/status")
async def get_analysis_status():
    """
    Check if the analysis service is ready and diagnose issues
    """
    import sys

    status = {
        "ready": True,
        "memory": {},
        "modules": {},
        "errors": []
    }

    # Check memory (without psutil)
    try:
        import resource
        usage = resource.getrusage(resource.RUSAGE_SELF)
        status["memory"] = {
            "max_rss_mb": round(usage.ru_maxrss / 1024, 2) if sys.platform == 'darwin' else round(usage.ru_maxrss / 1024 / 1024, 2)
        }
    except Exception as e:
        status["memory"] = {"note": "Memory stats not available"}

    # Check if modules can be imported (without initializing)
    modules_to_check = [
        ("numpy", "numpy"),
        ("cv2", "opencv"),
        ("PIL", "pillow"),
    ]

    for module_name, display_name in modules_to_check:
        try:
            __import__(module_name)
            status["modules"][display_name] = True
        except ImportError as e:
            status["modules"][display_name] = False
            status["errors"].append(f"{display_name}: {str(e)}")

    status["ready"] = len(status["errors"]) == 0

    return status


@router.post("/validate-url")
async def validate_url(request: ValidateURLRequest):
    """
    Validate if a URL is a valid URL.
    
    Request body:
    ```json
    {
      "url": "https://example.com"
    }
    ```
    """
    try:
        url = request.url
        if not url:
            return {
                "valid": False,
                "message": "URL is required"
            }
        
        # Basic URL validation
        if not (url.startswith("http://") or url.startswith("https://")):
            return {
                "valid": False,
                "message": "Invalid URL. Must start with http:// or https://"
            }
        
        return {
            "valid": True,
            "message": "Valid URL"
        }
    except Exception as e:
        return {
            "valid": False,
            "message": f"Error validating URL: {str(e)}"
        }

