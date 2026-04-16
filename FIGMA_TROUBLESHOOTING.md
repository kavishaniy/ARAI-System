# Figma Integration Troubleshooting Guide

## Quick Diagnostics

### 1. Check Figma API Token

```bash
# Test if token is configured and valid
curl -H "X-Figma-Token: YOUR_TOKEN" \
  https://api.figma.com/v1/me

# Expected response (201 bytes):
# {
#   "id": "12345",
#   "handle": "your-figma-username",
#   "img_url": "https://...",
#   "email": "your@email.com"
# }

# If 401 Unauthorized:
# ❌ Token is invalid or expired

# If connection refused:
# ❌ Check your internet connection
```

### 2. Validate Your Figma URL

Before testing analysis, make sure your URL is correct:

```bash
# Valid URLs look like:
https://www.figma.com/file/ABC123XYZ/Project-Name
https://www.figma.com/design/ABC123XYZ/Project-Name?node-id=0%3A1

# Invalid URLs (won't work):
https://figma.com/proto/ABC123/... ❌ (proto links, not file links)
https://www.figma.com/community/... ❌ (community files)
https://www.figma.com/templates/... ❌ (templates)
```

### 3. Test File Accessibility

```bash
# Can your token read this file?
curl -H "X-Figma-Token: YOUR_TOKEN" \
  "https://api.figma.com/v1/files/ABC123XYZ"

# Response codes:
# 200 ✅ File is accessible
# 403 ❌ Access denied - file is private or token lacks permission
# 404 ❌ File not found - check the key/URL
# 429 ❌ Rate limited - wait a bit and retry
```

---

## Common Error Messages & Solutions

### Error 1: "No Figma token available"

```
HTTPError 401: No Figma token available. 
Please connect your Figma account or provide a token.
```

**Causes:**
1. `FIGMA_API_TOKEN` is not set in `.env`
2. Token is empty or invalid
3. Wrong environment variable name

**Fix:**

```bash
# 1. Get a token from https://www.figma.com/developers/api#auth
#    (Need a Figma account - free tier works)

# 2. Add to backend/.env
echo 'FIGMA_API_TOKEN=ffile_abc123xyz...' >> backend/.env

# 3. Restart backend
# On Render: redeploy the service
# Locally: kill and restart the backend

# 4. Verify it's loaded
curl http://localhost:8000/api/v1/figma/test-connection
```

---

### Error 2: "Invalid Figma URL"

```
ValueError: Invalid Figma URL: https://...
Expected format: https://www.figma.com/file/FILE_KEY/filename
```

**Causes:**
1. URL format is incorrect
2. Pasted wrong part of URL (node-id instead of file)
3. URL is for a prototype, not a file

**Solution:**
```
Your URL must be in one of these formats:
✅ https://www.figma.com/file/ABC123/ProjectName
✅ https://www.figma.com/design/ABC123/ProjectName

❌ https://www.figma.com/proto/ABC123/... (wrong type)
❌ https://www.figma.com/community/... (community file)

💡 How to get the right URL:
1. Open your Figma file
2. Copy the URL from your browser address bar
3. It should have /file/ or /design/ in it

If you only have node-id, use the file URL instead.
```

---

### Error 3: "No frames or screens found"

```
No frames or screens found in the Figma file.
Please ensure the file contains at least one frame or board.
```

**Causes:**
1. File is empty (no frames/boards)
2. All frames are hidden or on locked pages
3. File only has components (no artboards)

**Solution:**
```
In Figma:
1. Make sure you have at least one Frame or Board
   (Not: Component, Group, or Shape alone)
2. Frames should be visible (eye icon is on)
3. They should be on unlocked pages

Then try analyzing again.
```

---

### Error 4: "Access denied" (403)

```
403 Forbidden
File is not accessible with this token
Access denied to Figma file
```

**Causes:**
1. File is private and not shared with your account
2. Token doesn't have permission
3. File was deleted or moved

**Solution:**
```
Option A: Share the file
1. In Figma, click the file
2. Click "Share" (top right)
3. Share with your Figma account or make public

Option B: Make file public (for testing)
1. File → Share
2. "Anyone with link can view"
3. Copy link and use it

Option C: Verify token
1. Regenerate token at https://www.figma.com/developers/api#auth
2. Update FIGMA_API_TOKEN in .env
3. Restart backend

💡 Pro tip: Test with the Figma Team File (under Drafts)
   It's usually public and works great for testing.
```

---

### Error 5: "Rate limit exceeded" (429)

```
429 Too Many Requests
Rate limit exceeded
⚠️  The Figma API is temporarily unavailable
```

**Causes:**
1. Too many requests in short time
2. Multiple users analyzing simultaneously
3. Large files with many frames

**Solution:**
```
Immediate:
• Wait 1-2 minutes and try again
• The system has automatic retry with exponential backoff

Long-term:
1. Implement caching (don't re-analyze same file)
2. Batch requests (analyze multiple files sequentially)
3. Add rate limit queue for concurrent users

Current rate limits:
• ~30 requests per minute per IP
• ~120 per minute with proper backoff
```

---

### Error 6: "Timeout - request took too long"

```
Timeout: The server did not send data for 30 seconds
Request timed out while fetching...
```

**Causes:**
1. Figma API or CDN is slow
2. File is very large with many frames
3. Network latency

**Solution:**
```
Quick fix:
1. Try again - might be temporary network issue
2. Analyze a smaller file first to test

If persistent:
1. Check your internet connection
2. Figma's CDN might be slow - refresh in a minute
3. Break large file into smaller pieces

Backend fix (already in code):
• Timeout increased from 30s to 90s for image requests
• Exponential backoff on retries
• Non-critical timeouts don't fail entire analysis
```

---

### Error 7: "Get frame images returned empty"

```
⚠️ Could not fetch frame previews: ...
Analysis continues but without preview images
```

**Causes:**
1. Figma CDN is slow
2. Frames are too complex to render
3. Network timeout

**Solution:**
```
This is usually non-critical. Analysis still works:
✅ Accessibility scores - calculated
✅ Readability scores - calculated  
✅ Attention scores - calculated
⚠️ Preview images - might be missing

If you need images:
1. Try again later
2. Use smaller designs
3. Increase timeout on backend if needed
```

---

## Testing Your Setup

### Test 1: Basic API Connection

```bash
# Run this to verify token and API access
curl -H "X-Figma-Token: YOUR_TOKEN" \
  https://api.figma.com/v1/me
```

Expected: Your Figma username and email

### Test 2: File Extraction

```python
# Test locally
from app.core.figma_client import FigmaAPIClient

client = FigmaAPIClient(token="YOUR_TOKEN")

# Try extracting a known Figma file
file_key = "ABC123XYZ"  # From your test file URL
file_data = client.get_file(file_key)

print(f"✅ File name: {file_data.get('name')}")
print(f"📄 Pages: {len(file_data.get('document', {}).get('children', []))}")
```

### Test 3: Full Analysis

```bash
# Test the endpoint
curl -X POST http://localhost:8000/api/v1/analysis/figma-screens \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "figma_url": "https://www.figma.com/file/ABC123/TestFile",
    "figma_token": null
  }'

# Should return:
# {
#   "files": [
#     {
#       "file_name": "screen1",
#       "arai_score": 75.5,
#       ...
#     }
#   ]
# }
```

---

## Debugging in Production

### Enable Debug Logging

```bash
# In backend/.env
DEBUG=true
LOG_LEVEL=DEBUG

# Or set at runtime:
export LOG_LEVEL=DEBUG
uvicorn app.main:app --reload
```

### Check Recent Logs

```bash
# On Render
# → Go to your service
# → Click "Logs"
# → Search for "figma" or "error"

# Locally
tail -f backend.log | grep -i figma
```

### Monitor Rate Limits

```bash
# Watch rate limit headers
curl -i -H "X-Figma-Token: TOKEN" \
  https://api.figma.com/v1/me | grep RateLimit

# Shows:
# X-RateLimit-Remaining: 28
# X-RateLimit-Reset-Interval: 60
```

---

## Advanced Diagnostics

### Check Token Scope

```bash
# Your token should have "file_content:read" scope
# Check at: https://www.figma.com/settings/personal-access-tokens

# Required scopes:
✅ file_content:read - Read file contents
```

### Test Rate Limiting Behavior

```python
import requests
import time

token = "YOUR_TOKEN"
headers = {"X-Figma-Token": token}

for i in range(5):
    response = requests.get(
        "https://api.figma.com/v1/me",
        headers=headers
    )
    remaining = response.headers.get('X-RateLimit-Remaining')
    print(f"Request {i+1}: {remaining} remaining")
    time.sleep(1)
```

### Analyze Figma File Structure

```python
from app.core.figma_client import FigmaAPIClient

client = FigmaAPIClient()
file_data = client.get_file("ABC123")

# Count pages and frames
pages = file_data.get('document', {}).get('children', [])
print(f"📄 Pages: {len(pages)}")

for page in pages:
    frames = [n for n in page.get('children', []) 
              if n.get('type') in ('FRAME', 'BOARD')]
    print(f"  📌 {page.get('name')}: {len(frames)} frames")
```

---

## When All Else Fails

### Contact Support / Debugging Checklist

Before reaching out, collect:

- [ ] Your Figma file URL
- [ ] Full error message (copy from error box)
- [ ] Backend logs (last 50 lines from logs)
- [ ] Test results from tests above
- [ ] Your Figma username
- [ ] File size (number of frames/pages)

### Provide This Info

```
Environment:
- OS: macOS/Windows/Linux
- Node version: X.X.X
- Python version: X.X.X

Error:
[paste error message]

Steps to reproduce:
[list what you did]

Logs:
[paste relevant logs]

File details:
- URL: https://...
- Number of frames: X
- File size: Approx X frames

Tested:
- [ ] Token works with curl
- [ ] URL format is correct
- [ ] File is accessible
- [ ] API connection is working
```

---

## Performance Tips

### For Large Figma Files (50+ frames)

```python
# 1. Analyze in batches
# Modify backend to process frames in smaller chunks

# 2. Use smaller scale for images
scale = 0.25  # Instead of 0.5, faster rendering

# 3. Cache results
# Store analysis results in Redis/database
# Don't re-analyze same file in 1 hour

# 4. Async processing
# Run analysis in background task
# Return status immediately to user
```

### For Multiple Users

```
1. Implement job queue (Celery/RQ)
2. Add rate limiting per user
3. Cache frequently analyzed files
4. Use CDN for frame images
5. Implement progress webhooks
```

---

## Reference: Figma API Endpoints Used

```bash
# Get user info (test connection)
GET https://api.figma.com/v1/me
Headers: X-Figma-Token: token

# Get file structure
GET https://api.figma.com/v1/files/{file_key}
Headers: X-Figma-Token: token

# Get node details
GET https://api.figma.com/v1/files/{file_key}/nodes?ids=node1,node2
Headers: X-Figma-Token: token

# Get rendered images
GET https://api.figma.com/v1/images/{file_key}?ids=node1,node2&scale=0.5&format=png
Headers: X-Figma-Token: token

# Response includes image URLs pointing to Figma CDN
{
  "images": {
    "0:1": "https://figma-render-prod-assets.s3.us-west-2.amazonaws.com/...",
    "0:2": "https://figma-render-prod-assets.s3.us-west-2.amazonaws.com/..."
  }
}
```

---

**Still stuck?** Check the full implementation guide in `FIGMA_INTEGRATION_FIX.md`
