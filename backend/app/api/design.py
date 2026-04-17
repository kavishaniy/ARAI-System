from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any, List
import logging
import requests
import asyncio
from io import BytesIO
from PIL import Image

router = APIRouter()
logger = logging.getLogger(__name__)

# Lazy imports for analyzers
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


def get_wcag_analyzer():
    """Lazy load WCAG analyzer"""
    WCAGClass = _import_wcag_analyzer()
    return WCAGClass()


def get_readability_analyzer():
    """Lazy load readability analyzer"""
    ReadClass = _import_readability_analyzer()
    return ReadClass()


def get_attention_analyzer():
    """Lazy load attention analyzer"""
    AttnClass = _import_attention_analyzer()
    return AttnClass()


# Test endpoint
@router.get("/design/test")
async def test_design_endpoint():
    """Test endpoint to verify design module is loaded"""
    logger.info("✅ Design analysis module test endpoint called")
    return {"status": "ok", "message": "Design analysis API module is working"}


@router.post("/design/analyze")
async def analyze_design_images(
    data: Dict[str, Any] = Body(...)
):
    """
    Analyze design images from URLs
    
    Request body:
    {
        "frames": [
            {
                "id": "1",
                "name": "Hero Section",
                "image_url": "https://..."
            },
            ...
        ]
    }
    """
    try:
        frames = data.get("frames", [])
        
        if not frames:
            raise HTTPException(
                status_code=400,
                detail="No frames provided"
            )
        
        logger.info(f"📥 Analyzing {len(frames)} design images")
        
        # Initialize analyzers
        wcag_analyzer = get_wcag_analyzer()
        readability_analyzer = get_readability_analyzer()
        attention_analyzer = get_attention_analyzer()
        
        # Collect analysis results
        frame_analyses = []
        
        # Analyze each design image
        for idx, frame in enumerate(frames):
            frame_id = frame.get("id", str(idx + 1))
            frame_name = frame.get("name", f"Design {idx + 1}")
            image_url = frame.get("image_url", "")
            
            try:
                if not image_url:
                    raise ValueError("Image URL is required")
                
                logger.info(f"⏳ Analyzing design {idx + 1}/{len(frames)}: {frame_name}")
                
                # Download image from URL
                logger.info(f"📥 Downloading image from: {image_url}")
                img_response = requests.get(image_url, timeout=30)
                
                if img_response.status_code != 200:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Failed to download image from URL. Status: {img_response.status_code}"
                    )
                
                # Convert to PIL Image
                image = Image.open(BytesIO(img_response.content)).convert("RGB")
                logger.info(f"✅ Image loaded: {image.size}")
                
                # Run analyses
                wcag_analysis = await asyncio.to_thread(
                    wcag_analyzer.analyze,
                    image
                )
                
                readability_analysis = await asyncio.to_thread(
                    readability_analyzer.analyze,
                    image
                )
                
                attention_analysis = await asyncio.to_thread(
                    attention_analyzer.analyze,
                    image
                )
                
                frame_result = {
                    "frame_id": frame_id,
                    "frame_name": frame_name,
                    "image_url": image_url,
                    "accessibility": wcag_analysis,
                    "readability": readability_analysis,
                    "attention": attention_analysis
                }
                
                frame_analyses.append(frame_result)
                logger.info(f"✅ Completed analysis for: {frame_name}")
                
            except HTTPException as http_err:
                logger.error(f"HTTP error analyzing {frame_name}: {http_err.detail}")
                frame_analyses.append({
                    "frame_id": frame_id,
                    "frame_name": frame_name,
                    "image_url": image_url,
                    "error": http_err.detail
                })
            except Exception as frame_error:
                logger.error(f"Error analyzing design {frame_name}: {str(frame_error)}")
                frame_analyses.append({
                    "frame_id": frame_id,
                    "frame_name": frame_name,
                    "image_url": image_url,
                    "error": str(frame_error)
                })
        
        # Calculate overall scores
        successful_analyses = [
            f for f in frame_analyses if "error" not in f
        ]
        
        if successful_analyses:
            # Calculate average scores
            avg_accessibility = sum(
                f.get("accessibility", {}).get("score", 0)
                for f in successful_analyses
            ) / len(successful_analyses)
            
            avg_readability = sum(
                f.get("readability", {}).get("score", 0)
                for f in successful_analyses
            ) / len(successful_analyses)
            
            avg_attention = sum(
                f.get("attention", {}).get("score", 0)
                for f in successful_analyses
            ) / len(successful_analyses)
        else:
            avg_accessibility = avg_readability = avg_attention = 0
        
        overall_score = (avg_accessibility + avg_readability + avg_attention) / 3
        
        results = {
            "status": "success",
            "project_name": "Design Analysis",
            "total_frames_analyzed": len(successful_analyses),
            "total_frames_requested": len(frames),
            "overall_score": overall_score,
            "scores": {
                "accessibility": avg_accessibility,
                "readability": avg_readability,
                "attention": avg_attention
            },
            "frames": frame_analyses,
            "timestamp": None
        }
        
        logger.info(f"✅ Design analysis completed. Overall score: {overall_score:.2f}")
        
        return results
        
    except HTTPException:
        raise
    except requests.RequestException as e:
        logger.error(f"Request error: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Failed to download design image: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error analyzing designs: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing designs: {str(e)}"
        )
