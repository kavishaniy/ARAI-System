from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any, List
import logging
import requests
import asyncio
import gc
import uuid
import tempfile
import os
import time
import numpy as np
from io import BytesIO
from PIL import Image
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)

FIGMA_API_BASE = "https://api.figma.com/v1"

# ── Lazy-loaded analyzers ──────────────────────────────────────────────────────

SimplifiedWCAGAnalyzer       = None
SimplifiedReadabilityAnalyzer = None
SimplifiedAttentionAnalyzer   = None


def _get_wcag():
    global SimplifiedWCAGAnalyzer
    if SimplifiedWCAGAnalyzer is None:
        from app.ai_modules.simplified_wcag_analyzer import SimplifiedWCAGAnalyzer as C
        SimplifiedWCAGAnalyzer = C
    return SimplifiedWCAGAnalyzer()


def _get_readability():
    global SimplifiedReadabilityAnalyzer
    if SimplifiedReadabilityAnalyzer is None:
        from app.ai_modules.simplified_readability_analyzer import SimplifiedReadabilityAnalyzer as C
        SimplifiedReadabilityAnalyzer = C
    return SimplifiedReadabilityAnalyzer()


def _get_attention():
    global SimplifiedAttentionAnalyzer
    if SimplifiedAttentionAnalyzer is None:
        from app.ai_modules.simplified_attention_analyzer import SimplifiedAttentionAnalyzer as C
        SimplifiedAttentionAnalyzer = C
    return SimplifiedAttentionAnalyzer()


# ── Helpers ───────────────────────────────────────────────────────────────────

def _to_native(obj):
    if isinstance(obj, np.integer):  return int(obj)
    if isinstance(obj, np.floating): return float(obj)
    if isinstance(obj, np.ndarray):  return obj.tolist()
    if isinstance(obj, dict):        return {k: _to_native(v) for k, v in obj.items()}
    if isinstance(obj, list):        return [_to_native(i) for i in obj]
    return obj


def _grade(score: float) -> str:
    if score >= 90: return "A"
    if score >= 80: return "B"
    if score >= 70: return "C"
    if score >= 60: return "D"
    return "F"


def _figma_headers(token: str) -> dict:
    return {"X-Figma-Token": token, "Content-Type": "application/json"}


def _figma_get(url: str, token: str, **kwargs) -> requests.Response:
    """GET with basic rate-limit retry."""
    for attempt in range(3):
        resp = requests.get(url, headers=_figma_headers(token), **kwargs)
        if resp.status_code == 429:
            time.sleep(2 * (attempt + 1))
            continue
        return resp
    return resp  # return last response even if still 429


def _extract_frames(document: dict) -> List[dict]:
    """Recursively collect FRAME / COMPONENT / COMPONENT_SET nodes."""
    frames = []

    def walk(node):
        t = node.get("type")
        if t in ("FRAME", "COMPONENT", "COMPONENT_SET", "BOARD"):
            bb = node.get("absoluteBoundingBox", {})
            frames.append({
                "id":     node.get("id", ""),
                "name":   node.get("name", "Unnamed"),
                "type":   t,
                "width":  int(bb.get("width",  0)),
                "height": int(bb.get("height", 0)),
            })
        for child in node.get("children", []):
            walk(child)

    for child in document.get("children", []):
        walk(child)

    return frames


async def _analyze_image_file(tmp_path: str) -> dict:
    """Run all three analyzers on a saved image file. Returns per-frame result."""
    wcag_result = await asyncio.to_thread(_get_wcag().analyze_design, tmp_path)
    gc.collect()
    read_result = await asyncio.to_thread(_get_readability().analyze_design, tmp_path)
    gc.collect()
    attn_result = await asyncio.to_thread(_get_attention().analyze_design, tmp_path)
    gc.collect()

    acc  = wcag_result.get("score", 50)
    read = read_result.get("score", 50)
    attn = attn_result.get("score", 50)
    arai = (acc * 0.4) + (read * 0.3) + (attn * 0.3)

    all_issues = (
        wcag_result.get("issues", []) +
        read_result.get("issues", []) +
        attn_result.get("issues", [])
    )

    return {
        "arai_score":     round(arai, 2),
        "arai_breakdown": {
            "overall":       round(arai, 2),
            "accessibility": round(acc,  2),
            "readability":   round(read, 2),
            "attention":     round(attn, 2),
        },
        "overall_grade":  _grade(arai),
        "accessibility":  wcag_result,
        "readability":    read_result,
        "attention":      attn_result,
        "issues":         all_issues,
        "issue_summary": {
            "critical": sum(1 for i in all_issues if i.get("severity") == "critical"),
            "high":     sum(1 for i in all_issues if i.get("severity") == "high"),
            "medium":   sum(1 for i in all_issues if i.get("severity") == "medium"),
            "passing":  sum(1 for i in all_issues if i.get("severity") == "success"),
        },
        "status": "completed",
    }


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/figma/test")
async def test_figma_endpoint():
    return {"status": "ok", "message": "Figma module is working"}


@router.post("/figma/frames")
async def get_figma_frames(data: Dict[str, Any] = Body(...)):
    """
    Fetch the list of top-level frames from a Figma file.
    Requires a Figma personal access token.
    """
    file_id     = (data.get("file_id")     or "").strip()
    figma_token = (data.get("figma_token") or "").strip()

    if not file_id:
        raise HTTPException(status_code=400, detail="file_id is required")
    if not figma_token:
        raise HTTPException(
            status_code=400,
            detail="A Figma personal access token is required to fetch frames."
        )

    logger.info(f"📥 Fetching frames for file: {file_id}")

    resp = _figma_get(f"{FIGMA_API_BASE}/files/{file_id}", figma_token, timeout=30)

    logger.info(f"Figma /files status: {resp.status_code}")

    if resp.status_code == 403:
        raise HTTPException(
            status_code=400,
            detail="Invalid Figma token or you don't have access to this file."
        )
    if resp.status_code == 404:
        raise HTTPException(status_code=400, detail="Figma file not found.")
    if resp.status_code == 429:
        raise HTTPException(status_code=429, detail="Figma API rate limit hit. Please wait a moment and try again.")
    if resp.status_code != 200:
        raise HTTPException(
            status_code=400,
            detail=f"Figma API error {resp.status_code}: {resp.text[:200]}"
        )

    document = resp.json().get("document", {})
    frames   = _extract_frames(document)

    if not frames:
        return {
            "status":  "error",
            "frames":  [],
            "message": "No frames found in this Figma file.",
            "code":    "NO_FRAMES_FOUND",
        }

    logger.info(f"✅ Found {len(frames)} frames")
    return {"status": "success", "frames": frames, "total_frames": len(frames)}


@router.post("/figma/analyze")
async def analyze_figma_frames(data: Dict[str, Any] = Body(...)):
    """
    Export selected Figma frames as PNG images via the Figma API and run the
    three analyzers on each one. Returns results in the same shape as the
    image-upload pipeline so MultipleAnalysisResults renders them identically.
    """
    file_id      = (data.get("file_id")      or "").strip()
    figma_token  = (data.get("figma_token")  or "").strip()
    frames: list = data.get("frames", [])

    if not file_id or not frames:
        raise HTTPException(status_code=400, detail="file_id and frames are required")
    if not figma_token:
        raise HTTPException(status_code=400, detail="Figma personal access token is required")

    node_ids = [f["id"] for f in frames if f.get("id")]
    if not node_ids:
        raise HTTPException(status_code=400, detail="No valid frame IDs provided")

    logger.info(f"📤 Exporting {len(node_ids)} frames from file {file_id}")

    # ── Export all frames in one Figma API call ───────────────────────────────
    # Figma /images endpoint: GET /v1/images/{file_id}?ids=id1,id2&format=png
    export_resp = _figma_get(
        f"{FIGMA_API_BASE}/images/{file_id}",
        figma_token,
        params={"ids": ",".join(node_ids), "format": "png", "scale": 2},
        timeout=60,
    )

    logger.info(f"Figma /images status: {export_resp.status_code}")

    if export_resp.status_code == 429:
        raise HTTPException(status_code=429, detail="Figma rate limit exceeded. Please wait and try again.")
    if export_resp.status_code != 200:
        raise HTTPException(
            status_code=400,
            detail=f"Figma export failed ({export_resp.status_code}): {export_resp.text[:200]}"
        )

    image_urls: dict = export_resp.json().get("images", {})
    logger.info(f"Got {len(image_urls)} image URLs from Figma")

    # ── Analyze each frame ────────────────────────────────────────────────────
    analyses = []

    for frame in frames:
        frame_id   = frame.get("id",   "")
        frame_name = frame.get("name", f"Frame")

        image_url = image_urls.get(frame_id)
        if not image_url:
            logger.warning(f"No export URL for frame '{frame_name}' ({frame_id}), skipping")
            continue

        logger.info(f"⏳ Analyzing '{frame_name}'…")

        # Download frame image
        try:
            dl = requests.get(image_url, timeout=30)
            dl.raise_for_status()
            image = Image.open(BytesIO(dl.content)).convert("RGB")
        except Exception as e:
            logger.error(f"Download failed for '{frame_name}': {e}")
            continue

        # Save to temp file (analyzers need a file path)
        tmp_path = None
        try:
            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
                tmp_path = tmp.name
                image.save(tmp_path, format="PNG")

            frame_result = await _analyze_image_file(tmp_path)
        except Exception as e:
            logger.error(f"Analysis failed for '{frame_name}': {e}", exc_info=True)
            continue
        finally:
            if tmp_path and os.path.exists(tmp_path):
                try: os.unlink(tmp_path)
                except: pass

        analyses.append({
            "analysis_id": str(uuid.uuid4()),
            "designName":  frame_name,
            "preview":     image_url,   # Figma CDN URL used as thumbnail
            **frame_result,
        })

        logger.info(f"✅ '{frame_name}' — ARAI: {frame_result['arai_score']}")

    if not analyses:
        raise HTTPException(
            status_code=500,
            detail="Failed to analyze any frames. Check your token and frame selection."
        )

    return {
        "status":    "success",
        "analyses":  _to_native(analyses),
        "timestamp": datetime.now().isoformat(),
    }


@router.post("/figma/analyze-url")
async def analyze_figma_url(data: Dict[str, Any] = Body(...)):
    """
    Single-design analysis via Figma oEmbed thumbnail (no token required,
    public files only). Returns the same shape as /analysis/upload.
    """
    project_url = (data.get("project_url") or "").strip()
    if not project_url:
        raise HTTPException(status_code=400, detail="project_url is required")

    logger.info(f"🔗 oEmbed request for: {project_url}")
    try:
        oembed_resp = requests.get(
            "https://www.figma.com/api/oembed",
            params={"url": project_url, "format": "json"},
            headers={"User-Agent": "ARAI-System/1.0"},
            timeout=20,
        )
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Could not reach Figma: {e}")

    logger.info(f"oEmbed status: {oembed_resp.status_code}  body: {oembed_resp.text[:300]}")

    if oembed_resp.status_code == 403:
        raise HTTPException(status_code=400, detail="Figma file is private. Share → Anyone with the link can view.")
    if oembed_resp.status_code == 404:
        raise HTTPException(status_code=400, detail="Figma file not found.")
    if oembed_resp.status_code != 200:
        raise HTTPException(status_code=400, detail=f"Figma error {oembed_resp.status_code}: {oembed_resp.text[:200]}")

    oembed        = oembed_resp.json()
    thumbnail_url = oembed.get("thumbnail_url")
    design_name   = oembed.get("title") or "Figma Design"

    if not thumbnail_url:
        raise HTTPException(status_code=400, detail="Figma did not return a preview image. Ensure the file is public and has content.")

    try:
        img_resp = requests.get(thumbnail_url, timeout=30)
        img_resp.raise_for_status()
        image = Image.open(BytesIO(img_resp.content)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to download preview: {e}")

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            tmp_path = tmp.name
            image.save(tmp_path, format="PNG")

        frame_result = await _analyze_image_file(tmp_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try: os.unlink(tmp_path)
            except: pass

    result = {
        "analysis_id":  str(uuid.uuid4()),
        "design_name":  design_name,
        "filename":     project_url,
        "thumbnail_url": thumbnail_url,
        "timestamp":    datetime.now().isoformat(),
        **frame_result,
    }

    logger.info(f"✅ Figma oEmbed analysis done — ARAI: {result['arai_score']}")
    return _to_native(result)


async def _analyze_frame_url(frame_url: str) -> dict:
    """Fetch oEmbed thumbnail for a single Figma frame URL and run all analyzers."""
    try:
        oembed_resp = requests.get(
            "https://www.figma.com/api/oembed",
            params={"url": frame_url, "format": "json"},
            headers={"User-Agent": "ARAI-System/1.0"},
            timeout=20,
        )
    except requests.RequestException as e:
        raise RuntimeError(f"Could not reach Figma: {e}")

    if oembed_resp.status_code == 403:
        raise RuntimeError("Figma file is private. Share → Anyone with the link can view.")
    if oembed_resp.status_code == 404:
        raise RuntimeError("Figma file not found.")
    if oembed_resp.status_code != 200:
        raise RuntimeError(f"Figma error {oembed_resp.status_code}: {oembed_resp.text[:200]}")

    oembed        = oembed_resp.json()
    thumbnail_url = oembed.get("thumbnail_url")
    design_name   = oembed.get("title") or "Figma Frame"

    if not thumbnail_url:
        raise RuntimeError("Figma did not return a preview image. Ensure the file is public.")

    img_resp = requests.get(thumbnail_url, timeout=30)
    img_resp.raise_for_status()
    image = Image.open(BytesIO(img_resp.content)).convert("RGB")

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            tmp_path = tmp.name
            image.save(tmp_path, format="PNG")
        frame_result = await _analyze_image_file(tmp_path)
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try: os.unlink(tmp_path)
            except: pass

    return {
        "analysis_id": str(uuid.uuid4()),
        "designName":  design_name,
        "preview":     thumbnail_url,
        **frame_result,
    }


@router.post("/figma/analyze-frames")
async def analyze_figma_frames_by_url(data: Dict[str, Any] = Body(...)):
    """
    Analyze multiple Figma frames by their share URLs (no token required).
    Each URL should be a frame-specific share link (right-click frame → Copy link).
    Returns {analyses: [...], timestamp} matching MultipleAnalysisResults format.
    """
    frame_urls: list = data.get("frame_urls", [])
    if not frame_urls:
        raise HTTPException(status_code=400, detail="frame_urls array is required")

    analyses = []
    errors   = []

    for url in frame_urls:
        url = url.strip()
        if not url:
            continue
        logger.info(f"⏳ Analyzing frame URL: {url}")
        try:
            result = await _analyze_frame_url(url)
            analyses.append(_to_native(result))
            logger.info(f"✅ Done — ARAI: {result['arai_score']}")
        except Exception as e:
            logger.error(f"Failed for {url}: {e}")
            errors.append({"url": url, "error": str(e)})

    if not analyses:
        detail = errors[0]["error"] if errors else "No frames could be analyzed."
        raise HTTPException(status_code=400, detail=detail)

    return {
        "status":    "success",
        "analyses":  analyses,
        "errors":    errors,
        "timestamp": datetime.now().isoformat(),
    }
