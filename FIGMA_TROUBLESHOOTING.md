# 🔧 Figma Integration - Troubleshooting & FAQ

## Common Issues & Solutions

### 1. "FIGMA_API_TOKEN not provided"

**Error Message:**
```
ValueError: Figma API token not provided. Set FIGMA_API_TOKEN environment variable
```

**Causes:**
- Environment variable not set
- Token not exported in shell
- Running in different shell session

**Solutions:**

```bash
# Option 1: Set in current session
export FIGMA_API_TOKEN="figd_xxx..."

# Option 2: Create .env file
echo "FIGMA_API_TOKEN=figd_xxx..." > backend/.env

# Option 3: Pass in request
curl -X POST http://localhost:8000/api/v1/figma/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "figma_url": "https://...",
    "figma_api_token": "figd_xxx..."
  }'

# Verify it's set
echo $FIGMA_API_TOKEN
```

**For Production (Railway):**
1. Go to Railway Dashboard
2. Select project
3. Click "Variables"
4. Add `FIGMA_API_TOKEN=figd_xxx...`
5. Redeploy

---

### 2. "Invalid Figma URL"

**Error Message:**
```json
{
  "valid": false,
  "message": "Invalid Figma URL. Expected format: https://www.figma.com/file/FILE_KEY/filename"
}
```

**Common URL Mistakes:**

```
❌ Wrong: https://www.figma.com/?node-id=123
❌ Wrong: figma.com/file/abc123 (missing https://)
❌ Wrong: https://www.figma.com/design/abc123/... (should still work, but old format)

✅ Correct: https://www.figma.com/file/abc123/MyDesign
✅ Correct: https://www.figma.com/design/abc123/MyDesign
```

**Solution:**
1. Open Figma file in browser
2. Copy URL from address bar
3. Make sure it's in format: `https://www.figma.com/file/{FILE_KEY}/...`
4. Paste into Arai app

---

### 3. "403 Forbidden - Invalid Token"

**Error Message:**
```
403 Forbidden: Invalid token or expired
```

**Causes:**
- Token is expired
- Token format is wrong
- Token belongs to different account
- Token was revoked

**Solutions:**

```bash
# Generate new token
# 1. Go to https://www.figma.com/settings/account
# 2. Scroll to "Personal access tokens"
# 3. Click "Create a new token"
# 4. Copy token (format: figd_xxx...)
# 5. Update environment variable

export FIGMA_API_TOKEN="figd_new_token"

# Test connection
curl -X GET http://localhost:8000/api/v1/figma/test-connection \
  -H "X-Figma-Token: figd_xxx..."
```

---

### 4. "404 File Not Found"

**Error Message:**
```
404 Not Found: File not found
```

**Causes:**
- File key is incorrect
- File was deleted
- File is private and token doesn't have access
- URL is malformed

**Solutions:**

```bash
# Verify file exists
# 1. Open URL in browser
# 2. If you can see file, URL is correct
# 3. If 404, file doesn't exist or is private

# Check file sharing
# In Figma:
# 1. Open file
# 2. Click "Share"
# 3. Make sure it's shared with your account or public
# 4. If private, share file with account that owns token
```

---

### 5. "429 Too Many Requests"

**Error Message:**
```
429 Too Many Requests: Rate limit exceeded
```

**Causes:**
- Analyzing too many files in short time
- Figma API rate limit: 300 requests/minute
- Large file with many API calls

**Solutions:**

```python
# Built-in retry with exponential backoff
# Already implemented in FigmaAPIClient

# Manual approach
import time
import requests

def with_retry(func, max_retries=3):
    for attempt in range(max_retries):
        try:
            return func()
        except requests.HTTPError as e:
            if e.response.status_code == 429:
                wait_time = 2 ** attempt  # 1s, 2s, 4s
                print(f"Rate limited. Waiting {wait_time}s...")
                time.sleep(wait_time)
                continue
            raise
    raise Exception("Max retries exceeded")

# Usage
result = with_retry(lambda: client.get_file(file_key))
```

**Workaround:**
- Analyze smaller files first
- Wait between analyses
- Contact Figma for higher rate limits (if needed)

---

### 6. "CORS Error" (Frontend)

**Error Message:**
```
Access to XMLHttpRequest at 'http://localhost:8000/api/v1/figma/analyze' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Causes:**
- Backend CORS not configured
- Frontend URL not in allowed origins
- Headers not set correctly

**Solutions:**

```python
# backend/app/main.py - Already configured
# But if issues persist:

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://your-domain.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

```bash
# Environment variable
export ALLOWED_ORIGINS="http://localhost:3000,https://your-domain.com"
```

---

### 7. "Analysis Timeout"

**Error Message:**
```
TimeoutError: Request to https://api.figma.com/v1/files/... timed out
```

**Causes:**
- File is very large (1000+ frames)
- Network is slow
- Default timeout is too short

**Solutions:**

```python
# backend/app/core/figma_client.py
class FigmaAPIClient:
    def __init__(self, token: str):
        self.session = requests.Session()
        self.session.timeout = 60  # Increase from default 30s

# Or set per request
response = self.session.get(url, timeout=120)  # 2 minutes
```

```python
# For very large files
# Increase timeout in production
response = client.session.get(url, timeout=300)  # 5 minutes
```

---

### 8. "Permission Denied - Can't Access File"

**Error Message:**
```
403 Forbidden: You do not have access to this file
```

**Causes:**
- File is private
- Token belongs to different workspace/account
- File has restricted permissions

**Solutions:**

```python
# In Figma:
# 1. Open the file
# 2. Click "Share" button (top right)
# 3. Either:
#    a. Share with specific email (your account)
#    b) Make it public (for anyone with link)
#    c) Add to team (if team workspace)

# Then try analysis again
```

---

### 9. "Database Connection Error"

**Error Message:**
```
ProgrammingError: relation "figma_analyses" does not exist
```

**Causes:**
- Table not created yet
- Using wrong database
- RLS policies blocking access

**Solutions:**

```sql
-- Create table in Supabase
CREATE TABLE figma_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  file_key TEXT NOT NULL,
  file_name TEXT,
  figma_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  accessibility_score FLOAT,
  readability_score FLOAT,
  attention_score FLOAT,
  overall_score FLOAT,
  analysis_data JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_user_id ON figma_analyses(user_id);
CREATE INDEX idx_created_at ON figma_analyses(created_at DESC);

-- Check if table exists
SELECT * FROM figma_analyses LIMIT 1;
```

**Verify credentials:**
```python
from app.core.database import supabase

# Test connection
try:
    result = supabase.table("figma_analyses").select("*").limit(1).execute()
    print("✅ Database connected!")
except Exception as e:
    print(f"❌ Database error: {e}")
```

---

### 10. "Memory Error" or "Out of Memory"

**Error Message:**
```
MemoryError: Unable to allocate memory for large file
```

**Causes:**
- File has thousands of elements
- Server has limited memory (free tier)
- Analyzing multiple large files

**Solutions:**

```python
# Enable LITE_MODE in production
export LITE_MODE=true

# This disables PyTorch and reduces memory usage

# Or increase server memory
# In Railway: Select higher tier plan
```

---

## FAQ - Frequently Asked Questions

### Q: How do I get my Figma API token?

**A:** 
1. Go to https://www.figma.com/settings/account
2. Scroll to "Personal access tokens"
3. Click "Create a new token"
4. Give it a name (e.g., "ARAI System")
5. Copy the token immediately (won't be shown again)
6. Format: `figd_xxx...`

### Q: Can multiple users use the same token?

**A:** No, tokens are personal. Each user should:
1. Generate their own token
2. Pass it in the request if not in env vars
3. Or set it in their environment

```json
{
  "figma_url": "https://www.figma.com/file/abc/Design",
  "figma_api_token": "user_specific_token"
}
```

### Q: How long does analysis take?

**A:** Typically:
- 5-10 seconds for small files (< 10 frames)
- 10-30 seconds for medium files (10-50 frames)
- 30-60+ seconds for large files (50+ frames)

Factors affecting time:
- Network speed
- File complexity
- Number of elements
- Server performance

### Q: Can I analyze shared files?

**A:** Yes, if:
1. File is shared with your Figma account, OR
2. File is public (anyone with link), OR
3. Both accounts in same team workspace

**Setup:**
- File owner clicks "Share"
- Add your email or make public
- Then analyze

### Q: Does it support components and variants?

**A:** Partially:
- ✅ Identifies components
- ✅ Extracts component properties
- ✅ Analyzes as regular elements
- ⚠️ Variant logic not extracted (future enhancement)

### Q: Can I analyze interactive prototypes?

**A:** No, only:
- ✅ Design elements (text, shapes, images)
- ✅ Layout and positioning
- ❌ Interactive prototypes
- ❌ Animations
- ❌ Scroll behavior

Analysis is static (design-time, not runtime).

### Q: What about assets and images?

**A:** Currently:
- ✅ Detects image elements
- ✅ Gets image bounds
- ⚠️ Doesn't download/analyze image content
- ⚠️ No OCR on images (future feature)

### Q: How do I export/save results?

**A:** Currently:
- ✅ Results stored in database
- ✅ Can retrieve via API
- ⚠️ No PDF export yet
- ⚠️ No JSON download yet

Future enhancement planned.

### Q: Can I delete my analysis history?

**A:** Yes:
```
DELETE /api/v1/figma/analyze/{analysis_id}
```

Requires user authentication.

### Q: Is my data secure?

**A:** Yes:
- ✅ Data encrypted in transit (HTTPS)
- ✅ Database access controlled (RLS)
- ✅ Tokens not stored, only used
- ✅ Figma API access only reads (no modifications)
- ⚠️ File content stored in database (for analysis)

### Q: Can I use this with my team?

**A:** Currently:
- ✅ One user per analysis
- ⚠️ No team sharing (future feature)
- ⚠️ No collaboration tools

Future: Multi-user, sharing, comments.

### Q: How do I integrate this into my workflow?

**A:** Options:

1. **Web App** (Current)
   - Open Arai website
   - Paste Figma URL
   - Get instant analysis

2. **API** (For developers)
   - POST to `/api/v1/figma/analyze`
   - Poll for results
   - Integrate into your tools

3. **Figma Plugin** (Future)
   - Analyze directly in Figma
   - See results in sidebar

### Q: What about large files?

**A:** Limitations:
- Files > 1000 frames: May timeout
- Files > 10000 elements: Memory issues
- Solution: Analyze per-page or per-section

```python
# Split analysis by page
for page in file.pages:
    analyze_page(page)  # Faster
```

### Q: Can I customize the analysis?

**A:** Currently:
- ✅ Choose analysis types
- ✅ Adjust thresholds (code-level)
- ⚠️ No UI customization yet

Future: Settings panel for weights/thresholds.

---

## Performance Tips

### Optimize Backend

```python
# 1. Enable caching
from functools import lru_cache

@lru_cache(maxsize=32)
def get_file_cached(file_key: str):
    return self.extractor.get_file(file_key)

# 2. Use async
async def analyze_multiple(urls: List[str]):
    tasks = [analyze_from_url(url) for url in urls]
    return await asyncio.gather(*tasks)

# 3. Enable production mode
export LITE_MODE=true
```

### Optimize Frontend

```jsx
// 1. Debounce URL input
const [url, setUrl] = useDebounce(figmaUrl, 500);

// 2. Cancel previous requests
const abortController = new AbortController();

// 3. Show progress indicator
{loading && <ProgressBar value={progress} />}
```

### Optimize Network

```python
# 1. Reduce payload size
response = {
    "analysis_id": id,
    "status": status,
    # Don't include full results until complete
}

# 2. Use compression
# FastAPI auto-compresses responses > 500 bytes

# 3. CDN for frontend
# Deploy frontend to Vercel/Netlify with CDN
```

---

## Debugging

### Enable Debug Logging

```python
# backend/app/main.py
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Now see detailed logs
logger.debug(f"Processing file: {file_key}")
logger.info(f"Analysis completed: {analysis_id}")
logger.error(f"Failed: {error}")
```

### Browser Console

```javascript
// frontend/src/components/FigmaAnalyzer.jsx

// Add console logs
console.log("Sending request:", request);
console.log("Response:", response);
console.log("Results:", results);
```

### Network Inspector

```
1. Open browser DevTools (F12)
2. Go to "Network" tab
3. Start analysis
4. See all requests/responses
5. Check status codes, timing, payloads
```

### Database Debugging

```sql
-- Check recent analyses
SELECT id, user_id, status, created_at 
FROM figma_analyses 
ORDER BY created_at DESC LIMIT 10;

-- Check failed analyses
SELECT id, status, error_message 
FROM figma_analyses 
WHERE status = 'failed';

-- Check database size
SELECT COUNT(*) as total FROM figma_analyses;
```

---

## Getting Help

### Resources
- [Full Guide](docs/FIGMA_INTEGRATION_GUIDE.md)
- [Setup Guide](FIGMA_SETUP.md)
- [Figma API Docs](https://www.figma.com/developers/api)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Supabase Docs](https://supabase.com/docs)

### Report Issues
1. Check this troubleshooting guide
2. Check documentation
3. Search existing issues
4. Create detailed bug report with:
   - Error message
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment (OS, browser, versions)

---

**Last Updated:** April 2026
**Maintained by:** ARAI Team
