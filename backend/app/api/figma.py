"""
Figma API Endpoints
Routes for Figma integration, OAuth flow, and analysis.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Header, Request
from fastapi.responses import RedirectResponse
from typing import Optional
import logging
import uuid
from datetime import datetime
import httpx
import secrets
import time

from app.models.figma_models import (
    FigmaRequestModel, FigmaAnalysisResponse, FigmaAnalysisStatus
)
from pydantic import BaseModel
from app.services.figma_service import FigmaAnalysisService
from app.core.database import save_figma_analysis_to_db, get_figma_analysis_from_db
from app.core.config import settings

router = APIRouter(prefix="/api/v1/figma", tags=["figma"])
logger = logging.getLogger(__name__)

# Store for in-progress analyses (in production, use Redis or database)
analysis_progress: dict = {}

# Store for OAuth states (in production, use Redis with expiry)
oauth_states: dict = {}


class ValidateUrlRequest(BaseModel):
    """Request to validate Figma URL"""
    url: str


class FigmaOAuthTokenRequest(BaseModel):
    """Request to exchange code for token"""
    code: str


# ============================================================================
# FIGMA OAUTH 2.0 ENDPOINTS
# ============================================================================

@router.get("/auth/login")
async def figma_oauth_login() -> dict:
    """
    Step 1: Initiate Figma OAuth flow
    Returns the Figma authorization URL that user should visit
    """
    if not settings.FIGMA_CLIENT_ID or not settings.FIGMA_REDIRECT_URI:
        raise HTTPException(
            status_code=500,
            detail="Figma OAuth credentials not configured. Set FIGMA_CLIENT_ID and FIGMA_REDIRECT_URI."
        )
    
    # Generate state token for CSRF protection
    state = secrets.token_urlsafe(32)
    oauth_states[state] = {
        "created_at": time.time(),  # Use unix timestamp instead of datetime
        "used": False
    }
    
    figma_auth_url = (
        f"https://www.figma.com/oauth?"
        f"client_id={settings.FIGMA_CLIENT_ID}"
        f"&redirect_uri={settings.FIGMA_REDIRECT_URI}"
        f"&scope=file_content:read"
        f"&response_type=code"
        f"&state={state}"
    )
    
    logger.info(f"🔐 OAuth login initiated with state: {state}")
    
    return {
        "auth_url": figma_auth_url,
        "message": "Redirect user to this URL to authorize ARAI access to their Figma account"
    }


@router.get("/auth/callback")
async def figma_oauth_callback(code: str, state: str, request: Request) -> dict:
    """
    Step 2: Handle Figma OAuth callback
    Figma redirects here with authorization code
    Exchange code for access token and store in session
    """
    if not settings.FIGMA_CLIENT_ID or not settings.FIGMA_CLIENT_SECRET or not settings.FIGMA_REDIRECT_URI:
        raise HTTPException(
            status_code=500,
            detail="Figma OAuth credentials not configured"
        )
    
    # Verify CSRF state
    if state not in oauth_states:
        logger.warning(f"⚠️ Invalid OAuth state: {state}")
        raise HTTPException(status_code=400, detail="Invalid state parameter. Possible CSRF attack.")
    
    if oauth_states[state]["used"]:
        logger.warning(f"⚠️ Reused OAuth state: {state}")
        raise HTTPException(status_code=400, detail="State already used. Please restart the login process.")
    
    oauth_states[state]["used"] = True
    
    try:
        # Exchange authorization code for access token
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://www.figma.com/api/oauth/token",
                data={
                    "client_id": settings.FIGMA_CLIENT_ID,
                    "client_secret": settings.FIGMA_CLIENT_SECRET,
                    "redirect_uri": settings.FIGMA_REDIRECT_URI,
                    "code": code,
                    "grant_type": "authorization_code"
                }
            )
        
        if token_response.status_code != 200:
            logger.error(f"❌ Token exchange failed: {token_response.text}")
            raise HTTPException(
                status_code=400,
                detail=f"Failed to get access token: {token_response.text}"
            )
        
        token_data = token_response.json()
        access_token = token_data.get("access_token")
        refresh_token = token_data.get("refresh_token")
        expires_in = token_data.get("expires_in", 3600)
        
        if not access_token:
            raise HTTPException(status_code=400, detail="No access token received from Figma")
        
        # Store token in session
        request.session["figma_access_token"] = access_token
        request.session["figma_refresh_token"] = refresh_token
        request.session["figma_token_expires"] = datetime.utcnow().timestamp() + expires_in
        
        logger.info(f"✅ OAuth token obtained successfully")
        
        return {
            "success": True,
            "message": "Successfully connected to Figma",
            "access_token": access_token,
            "expires_in": expires_in
        }
    
    except Exception as e:
        logger.error(f"❌ OAuth callback error: {e}")
        raise HTTPException(status_code=500, detail=f"OAuth error: {str(e)}")


@router.post("/auth/verify")
async def verify_figma_connection(request: Request) -> dict:
    """
    Verify if user has an active Figma OAuth connection
    """
    access_token = request.session.get("figma_access_token")
    
    if not access_token:
        return {
            "connected": False,
            "message": "No Figma connection found. Call /auth/login to connect."
        }
    
    try:
        # Test the token by making a simple API call
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {access_token}"}
            response = await client.get(
                "https://api.figma.com/v1/me",
                headers=headers
            )
        
        if response.status_code == 200:
            user_data = response.json()
            return {
                "connected": True,
                "user": user_data.get("handle", "Unknown"),
                "message": "Successfully connected to Figma"
            }
        else:
            return {
                "connected": False,
                "message": "Token invalid or expired. Please reconnect."
            }
    
    except Exception as e:
        logger.error(f"❌ Token verification error: {e}")
        return {
            "connected": False,
            "message": f"Verification error: {str(e)}"
        }


@router.post("/auth/disconnect")
async def disconnect_figma(request: Request) -> dict:
    """
    Disconnect user from Figma (remove tokens from session)
    """
    request.session.pop("figma_access_token", None)
    request.session.pop("figma_refresh_token", None)
    request.session.pop("figma_token_expires", None)
    
    return {
        "success": True,
        "message": "Disconnected from Figma"
    }


# ============================================================================
# FIGMA ANALYSIS ENDPOINTS (using OAuth tokens)
# ============================================================================


@router.post("/analyze")
async def analyze_figma(
    request: FigmaRequestModel,
    background_tasks: BackgroundTasks,
    session_request: Request,
    authorization: Optional[str] = Header(None)
) -> dict:
    """
    Analyze a Figma file for accessibility, readability, and attention.
    
    Uses OAuth token from session if available, otherwise uses provided token.
    
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
    
    # Get figma token - priority: provided token > session token > env token
    figma_token = request.figma_api_token
    if not figma_token:
        figma_token = session_request.session.get("figma_access_token")
    if not figma_token and settings.FIGMA_API_TOKEN:
        figma_token = settings.FIGMA_API_TOKEN
    
    if not figma_token:
        raise HTTPException(
            status_code=401,
            detail="No Figma token available. Please connect your Figma account or provide a token."
        )
    
    try:
        # Create analysis progress entry
        analysis_progress[analysis_id] = {
            "status": FigmaAnalysisStatus.PENDING,
            "progress": 0,
            "created_at": time.time()  # Use unix timestamp instead of datetime
        }
        
        logger.info(f"[{analysis_id}] 📋 New analysis request for: {request.figma_url[:50]}...")
        
        # Start background analysis
        background_tasks.add_task(
            _run_analysis_task,
            analysis_id=analysis_id,
            figma_url=request.figma_url,
            figma_api_token=figma_token,
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
        return {
            "analysis_id": analysis_id,
            "status": "failed",
            "error": progress.get('error', 'Unknown error'),
            "message": f"Analysis failed: {progress.get('error', 'Unknown error')}"
        }
    
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
        "created_at": datetime.fromtimestamp(progress["created_at"]).isoformat(),
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
async def validate_figma_url(request: ValidateUrlRequest) -> dict:
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
