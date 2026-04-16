# Figma Integration Fix Guide - ARAI System

## Status: ✅ Architecture Ready, Needs Testing & Edge Case Handling

Your system **already has most of the correct architecture**. Here's what's working and what needs attention.

---

## 1. Current Pipeline (What's Working ✅)

```
Figma URL Input
    ↓
Extract FILE_KEY using regex
    ↓
Call FigmaAPIClient.get_file(file_key) → Get JSON structure
    ↓
Extract all frames from JSON
    ↓
Call FigmaAPIClient.get_frame_images() → Get PNG URLs
    ↓
Download images from Figma CDN
    ↓
Run existing analysis pipeline (accessibility, readability, attention)
    ↓
Return results with scores
```

### Current Implementation Files:

1. **`backend/app/core/figma_client.py`** ✅
   - `FigmaAPIClient.extract_file_key()` - Extracts FILE_KEY from URL
   - `FigmaAPIClient.get_file()` - Fetches file JSON via Figma API
   - `FigmaAPIClient.get_frame_images()` - Gets PNG image URLs
   - Rate limiting & retry logic with exponential backoff

2. **`backend/app/services/figma_service.py`** ✅
   - `FigmaAnalysisService.analyze_from_url()` - Orchestrates analysis
   - Accessibility, readability, attention analyzers
   - Contrast ratio calculation (WCAG 2.1)

3. **`backend/app/api/analysis.py`** ✅
   - `/analysis/figma-screens` - Main endpoint
   - Converts results to unified format
   - Handles multiple frames/pages

4. **`frontend/src/components/FigmaAnalyzer.jsx`** ✅
   - Input form with URL validation
   - Progress tracking
   - Results display

---

## 2. Common Failure Points & Fixes

### 🔴 Problem 1: Missing or Invalid Figma API Token

**Symptom:** 
```
HTTPError 401: Unauthorized
No token provided
```

**Root Cause:**
- `FIGMA_API_TOKEN` not set in `.env`
- OR token is invalid/expired

**Fix:**
```bash
# 1. Get token from https://www.figma.com/developers/api#auth
# Click "Create a new personal access token"

# 2. Add to backend/.env
FIGMA_API_TOKEN=your_token_here_ffile_xxxxxxxxxxxxx

# 3. Restart backend
source start-backend-fast.sh

# 4. Test connection
curl -H "X-Figma-Token: your_token" \
  https://api.figma.com/v1/me
```

### 🔴 Problem 2: Invalid Figma URL Format

**Symptom:**
```
ValueError: Invalid Figma URL: ...
Expected format: https://www.figma.com/file/FILE_KEY/filename
```

**Root Cause:**
- URL doesn't match expected patterns
- User copy-pasted wrong URL

**Valid URLs:**
```
✅ https://www.figma.com/file/ABC123/MyProject?node-id=0%3A1
✅ https://www.figma.com/design/ABC123/MyProject
✅ https://www.figma.com/file/ABC123XY9z/Design-System

❌ https://figma.com/file/... (missing www)
❌ https://www.figma.com/proto/ABC123/... (proto link won't work)
❌ https://www.figma.com/community/... (community file)
```

**Fix:**
Update `FigmaAPIClient.extract_file_key()` to be more lenient:

```python
@staticmethod
def extract_file_key(figma_url: str) -> str:
    """Extract file key from Figma URL (improved)"""
    if not figma_url:
        raise ValueError("URL cannot be empty")
    
    # Try both patterns: /file/ and /design/
    pattern = r"figma\.com/(?:file|design)/([a-zA-Z0-9]+)"
    match = re.search(pattern, figma_url)
    
    if match:
        return match.group(1)
    
    # If not found, try to extract from any position
    pattern2 = r"/([a-zA-Z0-9]{22,})[/?]?"  # Figma keys are ~22 alphanumeric
    match2 = re.search(pattern2, figma_url)
    
    if match2:
        return match2.group(1)
    
    raise ValueError(
        f"Could not extract Figma file key from URL: {figma_url}\n"
        f"Expected format: https://www.figma.com/file/FILE_KEY/filename or "
        f"https://www.figma.com/design/FILE_KEY/filename"
    )
```

### 🔴 Problem 3: File Has No Frames/Screens

**Symptom:**
```
No frames or screens found in the Figma file.
Please ensure the file contains at least one frame or board.
```

**Root Cause:**
- File only has components, no frames
- All frames are hidden
- File structure is empty

**Fix in `backend/app/api/analysis.py`:**

```python
if not analysis_result or analysis_result.total_frames == 0:
    # Instead of hard error, return helpful message
    logger.warning(f"[{analysis_id}] ⚠️ No frames found in Figma file")
    
    # Try to analyze components if no frames
    if hasattr(analysis_result, 'total_components') and analysis_result.total_components > 0:
        logger.info(f"[{analysis_id}] 📦 Found {analysis_result.total_components} components instead")
        # Proceed with component analysis
    else:
        raise HTTPException(
            status_code=400,
            detail="No frames or components found. Please create at least one frame/board in your Figma file and try again."
        )
```

### 🔴 Problem 4: Figma API Rate Limiting

**Symptom:**
```
429 Too Many Requests
Rate limit exceeded
```

**Root Cause:**
- Figma API has rate limits: ~30 requests/minute
- Multiple users/requests hitting API simultaneously

**Current Fix (Already Implemented):** ✅
```python
# backend/app/core/figma_client.py has exponential backoff:
retry_strategy = Retry(
    total=5,  # Retry up to 5 times
    backoff_factor=1,  # 1s, 2s, 4s, 8s, 16s
    status_forcelist=[429, 500, 502, 503, 504]
)
```

**Additional Fix - Add Caching:**

```python
# backend/app/core/figma_client.py - add at module level

from functools import lru_cache
import hashlib

class FigmaAPIClient:
    # Cache file data for 1 hour to avoid repeated API calls
    @lru_cache(maxsize=50)
    def get_file_cached(self, file_key: str, timestamp_key: str):
        """
        Cached version of get_file.
        timestamp_key is hourly timestamp to invalidate cache after 1 hour.
        """
        return self.get_file(file_key)
    
    def get_file(self, file_key: str) -> Dict[str, Any]:
        """Fetch Figma file data"""
        # ... existing code ...
```

### 🔴 Problem 5: Network Timeout During Image Download

**Symptom:**
```
Timeout: The server did not send data for 30 seconds
Request timed out while fetching frame images
```

**Root Cause:**
- Figma CDN is slow
- Large images (many frames)
- Batch size too large

**Fix:**

```python
# backend/app/core/figma_client.py

def get_frame_images(self, file_key: str, node_ids: List[str], scale: float = 0.5, format: str = "png") -> Dict[str, str]:
    """Fetch rendered images with timeout handling"""
    if not node_ids:
        return {}
    
    ids_param = ",".join(node_ids)
    url = f"{self.BASE_URL}/images/{file_key}"
    params = {"ids": ids_param, "scale": scale, "format": format}
    
    try:
        # Increase timeout for image requests
        response = self.session.get(url, params=params, timeout=90)
        self._handle_rate_limit(response)
        response.raise_for_status()
        
        data = response.json()
        images = data.get("images", {})
        valid_images = {k: v for k, v in images.items() if v}
        logger.info(f"✅ Got {len(valid_images)}/{len(node_ids)} frame preview URLs")
        return valid_images
    
    except requests.Timeout:
        logger.warning(f"⚠️ Timeout fetching images for {len(node_ids)} frames")
        # Return what we got so far, don't fail entire analysis
        return {}
    except Exception as e:
        logger.error(f"❌ Error fetching images: {e}")
        return {}
```

### 🔴 Problem 6: Public File Permission Issues

**Symptom:**
```
403 Forbidden
File is not accessible with this token
```

**Root Cause:**
- File is private
- Token doesn't have permission
- File was deleted

**Fix:**

```python
# backend/app/core/figma_client.py

def get_file(self, file_key: str) -> Dict[str, Any]:
    """Fetch file with better error messages"""
    url = f"{self.BASE_URL}/files/{file_key}"
    
    try:
        response = self.session.get(url, timeout=60)
        self._handle_rate_limit(response)
        
        if response.status_code == 403:
            raise HTTPException(
                status_code=403,
                detail=(
                    "Access denied to Figma file. Possible reasons:\n"
                    "1. File is private and your token doesn't have permission\n"
                    "2. You need to share the file with your Figma account\n"
                    "3. File has sharing restrictions"
                )
            )
        elif response.status_code == 404:
            raise HTTPException(
                status_code=404,
                detail="Figma file not found. Check that the file key is correct and the file hasn't been deleted."
            )
        
        response.raise_for_status()
        return response.json()
    
    except requests.RequestException as e:
        logger.error(f"❌ Error fetching file: {e}")
        raise
```

---

## 3. Testing Checklist

Before deploying:

### ✅ Step 1: Verify Token Works
```bash
# Test your token
curl -H "X-Figma-Token: ffile_xxx" \
  https://api.figma.com/v1/me

# Expected response:
# {
#   "id": "123",
#   "handle": "your-figma-username"
# }
```

### ✅ Step 2: Test File Key Extraction
```python
from app.core.figma_client import FigmaAPIClient

urls = [
    "https://www.figma.com/file/ABC123/MyDesign",
    "https://www.figma.com/design/ABC123/MyDesign?node-id=0%3A1",
    "https://www.figma.com/file/ABC123XYZ/Design-System"
]

for url in urls:
    key = FigmaAPIClient.extract_file_key(url)
    print(f"✅ {url} → {key}")
```

### ✅ Step 3: Test File Fetch
```python
from app.core.figma_client import FigmaAPIClient

client = FigmaAPIClient(token="ffile_xxx")
file_data = client.get_file("ABC123")

print(f"✅ Fetched file: {file_data.get('name')}")
print(f"📄 Pages: {len(file_data.get('document', {}).get('children', []))}")
```

### ✅ Step 4: Test Full Pipeline
```bash
# Submit test Figma URL
curl -X POST http://localhost:8000/api/v1/analysis/figma-screens \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "figma_url": "https://www.figma.com/file/ABC123/MyDesign",
    "figma_token": null
  }'

# Expected response:
# {
#   "files": [
#     {
#       "file_name": "screen1",
#       "file_id": "uuid",
#       "arai_score": 75.5,
#       "accessibility_score": 85,
#       "readability_score": 70,
#       "attention_score": 72,
#       ...
#     }
#   ]
# }
```

---

## 4. Enhanced Error Messages for Frontend

Update error handling in `FigmaAnalyzer.jsx`:

```jsx
const handleAnalyzeClick = async () => {
  setError(null);
  setLoading(true);

  try {
    const analysisRes = await api.post(
      '/analysis/figma-screens',
      {
        figma_url: figmaUrl,
        figma_token: null
      },
      { timeout: 0 }
    );

    if (onAnalysisComplete) {
      onAnalysisComplete(analysisRes.data);
    }
  } catch (err) {
    const errorMsg = err.response?.data?.detail || err.message;
    
    // Provide actionable suggestions
    let suggestion = '';
    
    if (errorMsg.includes('token') || errorMsg.includes('401')) {
      suggestion = '💡 The Figma API token is not configured. Contact your admin.';
    } else if (errorMsg.includes('Invalid Figma URL') || errorMsg.includes('format')) {
      suggestion = '💡 Check your Figma URL. Should be like: https://www.figma.com/file/ABC123/ProjectName';
    } else if (errorMsg.includes('No frames') || errorMsg.includes('Empty')) {
      suggestion = '💡 Create at least one frame/board in your Figma file.';
    } else if (errorMsg.includes('403') || errorMsg.includes('Access denied')) {
      suggestion = '💡 The file is private. Either make it public or share it with your Figma account.';
    } else if (errorMsg.includes('404') || errorMsg.includes('not found')) {
      suggestion = '💡 The file might have been deleted or the URL is incorrect.';
    }
    
    setError(`${errorMsg}${suggestion ? '\n\n' + suggestion : ''}`);
    setLoading(false);
  }
};
```

---

## 5. Deployment Checklist

### Before going live:

- [ ] `FIGMA_API_TOKEN` is set in production `.env`
- [ ] Test with at least 3 different Figma files
- [ ] Test with files containing 1, 5, and 20+ frames
- [ ] Test rate limiting with concurrent requests
- [ ] Verify image downloads don't timeout
- [ ] Check error messages are helpful
- [ ] Test with private file (should fail gracefully)
- [ ] Monitor logs for any API errors

### Environment Variables Required:

```bash
# backend/.env
FIGMA_API_TOKEN=ffile_xxxxxxxxxxxxx
```

---

## 6. Advanced: Implement Smart Caching

For production, implement Redis caching to avoid re-analyzing same files:

```python
# backend/app/core/cache.py
import redis
import json
from typing import Optional

class FigmaCache:
    def __init__(self, redis_url: Optional[str] = None):
        self.redis_client = redis.from_url(redis_url) if redis_url else None
    
    def get_cached_analysis(self, file_key: str) -> Optional[dict]:
        """Get cached analysis if exists"""
        if not self.redis_client:
            return None
        
        cached = self.redis_client.get(f"figma:analysis:{file_key}")
        return json.loads(cached) if cached else None
    
    def cache_analysis(self, file_key: str, analysis_result: dict, ttl: int = 3600):
        """Cache analysis for 1 hour"""
        if not self.redis_client:
            return
        
        self.redis_client.setex(
            f"figma:analysis:{file_key}",
            ttl,
            json.dumps(analysis_result)
        )
```

---

## 7. Monitoring & Debugging

### Enable detailed logging:

```python
# backend/app/main.py
import logging

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] %(name)s - %(message)s'
)

# Set Figma logging to INFO
logging.getLogger('app.core.figma_client').setLevel(logging.INFO)
logging.getLogger('app.services.figma_service').setLevel(logging.INFO)
```

### Monitor these endpoints in production:

```bash
# Check Figma API status
GET /api/v1/figma/test-connection

# Monitor recent analyses
GET /api/v1/analysis/status/{analysis_id}

# Check rate limit headers
# Look for X-RateLimit-Remaining in response headers
```

---

## Summary

Your system is **architecturally sound**. The key to success:

1. ✅ **Get a valid Figma API token** - This is the #1 blocker
2. ✅ **Test with real Figma files** - Start simple, then complex
3. ✅ **Handle edge cases** - Private files, empty files, timeouts
4. ✅ **Monitor and log** - Catch issues before users report them
5. ✅ **Provide helpful error messages** - Users don't know Figma API quirks

**Next Steps:**
1. Set `FIGMA_API_TOKEN` in `.env`
2. Run the testing checklist
3. Deploy and monitor logs
4. Iterate based on real usage

Questions? Check the error logs - they'll tell you exactly what's wrong! 🚀
