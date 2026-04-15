from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Header, Body
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


class FigmaScreensAnalysisRequest(BaseModel):
    figma_url: str
    figma_token: Optional[str] = None

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
    save_figma_analysis_to_db,
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
        arai_score = (acc_score * 0.4) + (read_score * 0.3) + (attn_score * 0.3)
        
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
        
        # Compile final results
        final_results = {
            "analysis_id": analysis_id,
            "design_name": design_name or file.filename,
            "filename": file.filename,
            "timestamp": timestamp,
            
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
async def validate_figma_url(request: ValidateURLRequest):
    """
    Validate if a URL is a valid Figma file link.
    
    Request body:
    ```json
    {
      "url": "https://www.figma.com/file/..."
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
        
        if "figma.com/file/" not in url and "figma.com/design/" not in url:
            return {
                "valid": False,
                "message": "Invalid Figma URL. Must be a Figma file or design URL like https://www.figma.com/design/abc123/ProjectName"
            }
        
        # Try to extract file key
        try:
            from app.core.figma_client import FigmaAPIClient
            file_key = FigmaAPIClient.extract_file_key(url)
            return {
                "valid": True,
                "file_key": file_key,
                "message": "Valid Figma URL"
            }
        except ValueError as e:
            return {
                "valid": False,
                "message": f"Invalid Figma URL: {str(e)}"
            }
    except Exception as e:
        return {
            "valid": False,
            "message": f"Error validating URL: {str(e)}"
        }


@router.post("/figma-screens")
async def analyze_figma_screens(
    request: FigmaScreensAnalysisRequest,
    current_user = Depends(get_current_user)
):
    """
    Analyze all screens in a Figma project file.
    Returns individual analysis results for each screen in the same format as image uploads.

    Request body:
    {
      "figma_url": "https://www.figma.com/design/abc123/ProjectName",
      "figma_token": "optional-token"
    }
    """
    try:
        figma_url = request.figma_url
        figma_token = request.figma_token

        logger.info(f"📋 Figma screens analysis request from user: {current_user.id}")

        # Validate URL
        if not figma_url:
            raise HTTPException(status_code=400, detail="figma_url is required")

        if "figma.com/file/" not in figma_url and "figma.com/design/" not in figma_url:
            raise HTTPException(
                status_code=400,
                detail="Invalid Figma URL. Must be a Figma file or design URL like https://www.figma.com/design/abc123/ProjectName"
            )
        
        # Use provided token, environment token, or raise error
        token_to_use = figma_token or settings.FIGMA_API_TOKEN
        if not token_to_use:
            raise HTTPException(
                status_code=401,
                detail="No Figma token provided. Set FIGMA_API_TOKEN or provide figma_token parameter."
            )
        
        # Generate analysis ID
        analysis_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        
        logger.info(f"[{analysis_id}] 🔍 Starting Figma screens analysis for: {figma_url[:60]}...")
        
        # Import Figma service
        from app.services.figma_service import FigmaAnalysisService
        from app.core.figma_client import FigmaAPIClient
        
        try:
            # Extract file key from URL
            file_key = FigmaAPIClient.extract_file_key(figma_url)
            logger.info(f"[{analysis_id}] 📁 Extracted file key: {file_key}")
            
            # Initialize service with token
            service = FigmaAnalysisService(figma_token=token_to_use)
            
            # Run analysis
            logger.info(f"[{analysis_id}] 📊 Analyzing all screens...")
            analysis_result = await service.analyze_from_url(
                figma_url,
                analysis_scope=["accessibility", "readability", "attention"]
            )
            
            if not analysis_result or analysis_result.total_frames == 0:
                logger.warning(f"[{analysis_id}] ⚠️ No frames found in Figma file")
                raise HTTPException(
                    status_code=400,
                    detail="No frames or screens found in the Figma file. Please ensure the file contains at least one frame or board."
                )

            logger.info(f"[{analysis_id}] ✅ Figma analysis completed: {analysis_result.total_frames} frames across {analysis_result.total_pages} pages")

            def get_grade(score):
                if score >= 90: return "A"
                elif score >= 80: return "B"
                elif score >= 70: return "C"
                elif score >= 60: return "D"
                else: return "F"

            # Fetch frame preview images from Figma's /images API (non-blocking).
            frame_preview_map: dict = {}
            try:
                all_frame_ids = [
                    frame_result.frame_id
                    for page_result in analysis_result.page_results
                    for frame_result in page_result.frame_results
                ]
                if all_frame_ids:
                    loop = asyncio.get_event_loop()
                    batch_size = 200
                    for i in range(0, len(all_frame_ids), batch_size):
                        batch = all_frame_ids[i : i + batch_size]
                        # Run blocking HTTP call in thread pool
                        batch_images = await loop.run_in_executor(
                            None,
                            lambda b=batch: service.extractor.client.get_frame_images(
                                file_key, b, scale=0.5
                            )
                        )
                        frame_preview_map.update(batch_images)
                    logger.info(f"[{analysis_id}] 📸 Fetched {len(frame_preview_map)} frame preview URLs")
            except Exception as img_err:
                logger.warning(f"[{analysis_id}] ⚠️ Could not fetch frame previews: {img_err}")

            # Convert to format compatible with SimplifiedAnalysisResults / MultipleAnalysisResults
            converted_analyses = []

            for page_result in analysis_result.page_results:
                for frame_result in page_result.frame_results:
                    arai_score = float(frame_result.overall_score or 50)
                    accessibility_score = float(frame_result.accessibility.score if frame_result.accessibility else 50)
                    readability_score = float(frame_result.readability.score if frame_result.readability else 50)
                    attention_score = float(frame_result.attention.score if frame_result.attention else 50)

                    # Build structured accessibility issues
                    accessibility_issues = []
                    if frame_result.accessibility:
                        for issue in (frame_result.accessibility.contrast_issues or []):
                            accessibility_issues.append({
                                "title": "Color Contrast Issue",
                                "description": issue,
                                "severity": "high",
                                "improvement_points": "Increase the contrast ratio between foreground and background colors to meet WCAG 2.1 standards.",
                                "how_to_fix": [
                                    "Use a contrast checker tool to measure the current ratio",
                                    "Aim for a minimum contrast ratio of 4.5:1 for normal text",
                                    "Use darker text on light backgrounds or lighter text on dark backgrounds"
                                ],
                                "best_practice": "WCAG 2.1 Level AA requires a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text."
                            })
                        for issue in (frame_result.accessibility.font_size_issues or []):
                            accessibility_issues.append({
                                "title": "Font Size Too Small",
                                "description": issue,
                                "severity": "medium",
                                "improvement_points": "Increase the font size so text is readable without zooming.",
                                "how_to_fix": [
                                    "Use a minimum font size of 16px for body text",
                                    "Ensure all text can be scaled up to 200% without loss of content",
                                    "Avoid using font sizes below 12px"
                                ],
                                "best_practice": "Use relative units (rem/em) instead of fixed px values to support user font-size preferences."
                            })
                        for rec in (frame_result.accessibility.recommendations or []):
                            accessibility_issues.append({
                                "title": "Accessibility Recommendation",
                                "description": rec,
                                "severity": "medium",
                                "improvement_points": rec,
                                "how_to_fix": [rec],
                                "best_practice": "Follow WCAG 2.1 guidelines for accessible design."
                            })
                    if not accessibility_issues:
                        accessibility_issues.append({
                            "title": "Accessibility Check Passed",
                            "description": f"No major accessibility issues detected. Score: {accessibility_score:.1f}",
                            "severity": "success",
                            "improvement_points": "Continue following accessible design practices.",
                            "how_to_fix": [],
                            "best_practice": "Run periodic accessibility audits as the design evolves."
                        })

                    # Build structured readability issues
                    readability_issues = []
                    if frame_result.readability:
                        if frame_result.readability.text_density > 70:
                            readability_issues.append({
                                "title": "High Text Density",
                                "description": f"Text density is {frame_result.readability.text_density:.1f}%, which may overwhelm readers.",
                                "severity": "medium",
                                "improvement_points": "Reduce the amount of text on screen or add more white space to improve readability.",
                                "how_to_fix": [
                                    "Break long paragraphs into shorter ones",
                                    "Add more padding and margins between text blocks",
                                    "Use bullet points or numbered lists to present dense information"
                                ],
                                "best_practice": "Aim for a text density below 40% for comfortable reading on digital screens."
                            })
                        for rec in (frame_result.readability.recommendations or []):
                            readability_issues.append({
                                "title": "Readability Recommendation",
                                "description": rec,
                                "severity": "medium",
                                "improvement_points": rec,
                                "how_to_fix": [rec],
                                "best_practice": "Follow typography best practices for clear communication."
                            })
                    if not readability_issues:
                        readability_issues.append({
                            "title": "Readability Check Passed",
                            "description": f"No major readability issues detected. Score: {readability_score:.1f}",
                            "severity": "success",
                            "improvement_points": "Continue using clear typography and proper spacing.",
                            "how_to_fix": [],
                            "best_practice": "Regularly review typography choices as content changes."
                        })

                    # Build structured attention/visual hierarchy issues
                    attention_issues = []
                    if frame_result.attention:
                        if frame_result.attention.visual_hierarchy == "weak":
                            attention_issues.append({
                                "title": "Weak Visual Hierarchy",
                                "description": "The design lacks a clear visual hierarchy, making it hard for users to prioritise information.",
                                "severity": "medium",
                                "improvement_points": "Create stronger size and weight distinctions between primary and secondary content.",
                                "how_to_fix": [
                                    "Use larger font sizes or bolder weights for headings",
                                    "Increase contrast between primary and secondary elements",
                                    "Apply visual weight through size, colour, and positioning"
                                ],
                                "best_practice": "Strong visual hierarchy guides users through content naturally, reducing cognitive load."
                            })
                        for rec in (frame_result.attention.recommendations or []):
                            attention_issues.append({
                                "title": "Visual Attention Recommendation",
                                "description": rec,
                                "severity": "medium",
                                "improvement_points": rec,
                                "how_to_fix": [rec],
                                "best_practice": "Guide user attention with clear visual cues and focal points."
                            })
                    if not attention_issues:
                        attention_issues.append({
                            "title": "Visual Hierarchy Check Passed",
                            "description": f"Visual hierarchy appears well structured. Score: {attention_score:.1f}",
                            "severity": "success",
                            "improvement_points": "Continue using clear size and weight distinctions between elements.",
                            "how_to_fix": [],
                            "best_practice": "Test your design with real users to confirm the hierarchy feels intuitive."
                        })

                    screen_analysis = {
                        "designName": f"{page_result.page_name} - {frame_result.frame_name}",
                        # Fields required by SimplifiedAnalysisResults
                        "arai_score": arai_score,
                        "overall_grade": get_grade(arai_score),
                        "arai_breakdown": {
                            "accessibility": accessibility_score,
                            "readability": readability_score,
                            "attention": attention_score
                        },
                        "accessibility": {
                            "score": accessibility_score,
                            "issues": accessibility_issues
                        },
                        "readability": {
                            "score": readability_score,
                            "issues": readability_issues
                        },
                        "attention": {
                            "score": attention_score,
                            "issues": attention_issues
                        },
                        # Frame preview image URL (from Figma /images API)
                        "preview": frame_preview_map.get(frame_result.frame_id),
                        # Metadata
                        "fileName": f"{analysis_result.file_name} - {page_result.page_name}",
                        "timestamp": timestamp,
                        "analysisId": analysis_id,
                        "pageId": page_result.page_id,
                        "frameId": frame_result.frame_id,
                        "figmaUrl": figma_url,
                        "source": "figma"
                    }

                    converted_analyses.append(screen_analysis)

            avg_arai = (
                sum(a["arai_score"] for a in converted_analyses) / len(converted_analyses)
                if converted_analyses else 50
            )

            # Prepare combined response
            combined_response = {
                "analyses": converted_analyses,
                "timestamp": timestamp,
                "analysisId": analysis_id,
                "totalScreens": len(converted_analyses),
                "totalPages": analysis_result.total_pages,
                "fileName": analysis_result.file_name,
                "figmaUrl": figma_url,
                "averageAraiScore": avg_arai,
                "processingTime": analysis_result.processing_time_seconds
            }
            
            # Save to database using the Figma-specific function
            try:
                await save_figma_analysis_to_db(
                    analysis_id=analysis_id,
                    user_id=str(current_user.id),
                    figma_url=figma_url,
                    analysis_data=combined_response
                )
                logger.info(f"[{analysis_id}] 💾 Analysis saved to database")
            except Exception as db_error:
                logger.warning(f"[{analysis_id}] ⚠️ Failed to save to database: {db_error}")
                # Continue even if database save fails
            
            return combined_response
        
        except Exception as figma_error:
            logger.error(f"[{analysis_id}] ❌ Figma analysis error: {figma_error}")
            raise HTTPException(
                status_code=400,
                detail=f"Figma analysis failed: {str(figma_error)}"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error in figma-screens endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

