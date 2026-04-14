"""
Figma API Endpoints
Routes for Figma integration and analysis.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Header
from typing import Optional
import logging
import uuid
from datetime import datetime

from app.models.figma_models import (
    FigmaRequestModel, FigmaAnalysisResponse, FigmaAnalysisStatus
)
from app.services.figma_service import FigmaAnalysisService
from app.core.database import save_figma_analysis_to_db, get_figma_analysis_from_db

router = APIRouter(prefix="/api/v1/figma", tags=["figma"])
logger = logging.getLogger(__name__)

# Store for in-progress analyses (in production, use Redis or database)
analysis_progress: dict = {}


@router.post("/analyze")
async def analyze_figma(
    request: FigmaRequestModel,
    background_tasks: BackgroundTasks,
    authorization: Optional[str] = Header(None)
) -> dict:
    """
    Analyze a Figma file for accessibility, readability, and attention.
    
    Request body:
    ```json
    {
      "figma_url": "https://www.figma.com/file/abc123/MyDesign",
      "figma_api_token": "optional_token",
      "analysis_scope": ["accessibility", "readability", "attention"]
    }
    ```
    
    Returns:
    ```json
    {
      "analysis_id": "uuid",
      "status": "pending",
      "message": "Analysis started"
    }
    ```
    """
    analysis_id = str(uuid.uuid4())
    
    try:
        # Create analysis progress entry
        analysis_progress[analysis_id] = {
            "status": FigmaAnalysisStatus.PENDING,
            "progress": 0,
            "created_at": datetime.utcnow()
        }
        
        logger.info(f"[{analysis_id}] 📋 New analysis request for: {request.figma_url[:50]}...")
        
        # Start background analysis
        background_tasks.add_task(
            _run_analysis_task,
            analysis_id=analysis_id,
            figma_url=request.figma_url,
            figma_api_token=request.figma_api_token,
            analysis_scope=request.analysis_scope or ["accessibility", "readability", "attention"],
            authorization=authorization
        )
        
        return {
            "analysis_id": analysis_id,
            "status": "pending",
            "message": "Analysis started. Check status using the analysis_id."
        }
    
    except Exception as e:
        logger.error(f"[{analysis_id}] Error starting analysis: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/analyze/{analysis_id}")
async def get_analysis_result(analysis_id: str) -> dict:
    """
    Get results of a Figma analysis.
    
    Returns analysis data if completed, or status if still processing.
    """
    if analysis_id not in analysis_progress:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    progress = analysis_progress[analysis_id]
    
    if progress["status"] == FigmaAnalysisStatus.COMPLETED:
        # Retrieve full results
        return progress.get("result", {})
    
    elif progress["status"] == FigmaAnalysisStatus.FAILED:
        raise HTTPException(
            status_code=400,
            detail=f"Analysis failed: {progress.get('error', 'Unknown error')}"
        )
    
    else:
        # Return progress update
        return {
            "analysis_id": analysis_id,
            "status": progress["status"],
            "progress": progress.get("progress", 0),
            "current_step": progress.get("current_step", "Starting..."),
            "message": progress.get("message")
        }


@router.get("/analyze/{analysis_id}/status")
async def get_analysis_status(analysis_id: str) -> dict:
    """
    Get current status of analysis (without full results).
    """
    if analysis_id not in analysis_progress:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    progress = analysis_progress[analysis_id]
    
    return {
        "analysis_id": analysis_id,
        "status": progress["status"],
        "progress": progress.get("progress", 0),
        "current_step": progress.get("current_step"),
        "created_at": progress["created_at"],
        "message": progress.get("message")
    }


async def _run_analysis_task(
    analysis_id: str,
    figma_url: str,
    figma_api_token: Optional[str],
    analysis_scope: list,
    authorization: Optional[str]
):
    """
    Background task to run Figma analysis.
    """
    try:
        # Extract user ID from authorization header if needed
        user_id = "anonymous"
        # You can parse JWT token here to get real user_id
        
        logger.info(f"[{analysis_id}] 🔄 Starting Figma analysis...")
        analysis_progress[analysis_id].update({
            "status": FigmaAnalysisStatus.EXTRACTING,
            "progress": 10,
            "current_step": "Extracting Figma data..."
        })
        
        # Initialize service with optional token
        service = FigmaAnalysisService(figma_api_token)
        
        # Run analysis
        logger.info(f"[{analysis_id}] 📊 Running analysis...")
        analysis_progress[analysis_id].update({
            "status": FigmaAnalysisStatus.ANALYZING,
            "progress": 50,
            "current_step": "Analyzing design..."
        })
        
        result = await service.analyze_from_url(figma_url, analysis_scope)
        
        # Save to database
        logger.info(f"[{analysis_id}] 💾 Saving to database...")
        analysis_progress[analysis_id]["progress"] = 90
        
        # Convert to dict for storage
        result_dict = result.dict()
        await save_figma_analysis_to_db(
            analysis_id=analysis_id,
            user_id=user_id,
            figma_url=figma_url,
            analysis_data=result_dict
        )
        
        # Update progress
        analysis_progress[analysis_id].update({
            "status": FigmaAnalysisStatus.COMPLETED,
            "progress": 100,
            "current_step": "Complete",
            "result": result_dict
        })
        
        logger.info(f"[{analysis_id}] ✅ Analysis completed successfully")
    
    except Exception as e:
        logger.error(f"[{analysis_id}] ❌ Analysis failed: {e}")
        analysis_progress[analysis_id].update({
            "status": FigmaAnalysisStatus.FAILED,
            "error": str(e),
            "current_step": "Error"
        })


@router.post("/validate-url")
async def validate_figma_url(url: str) -> dict:
    """
    Validate if a URL is a valid Figma file link.
    
    Query params:
    - url: Figma URL to validate
    """
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
            "message": str(e)
        }


@router.get("/test-connection")
async def test_figma_connection(token: Optional[str] = Header(None, alias="X-Figma-Token")) -> dict:
    """
    Test Figma API connection.
    """
    try:
        from app.core.figma_client import FigmaAPIClient
        
        # Use provided token or env var
        client = FigmaAPIClient(token)
        
        return {
            "connected": True,
            "message": "Successfully connected to Figma API"
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Figma API error: {str(e)}")
