# Code Changes - Rate Limit Fix

## File 1: `backend/app/core/figma_client.py`

### Change 1: Added Imports
```python
# ADDED:
import time
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
```

### Change 2: Enhanced Session with Retry Strategy
```python
def __init__(self, token: Optional[str] = None):
    # ... existing code ...
    
    # NEW CODE - Retry strategy for rate limiting:
    retry_strategy = Retry(
        total=5,  # Max 5 retries
        backoff_factor=1,  # Exponential backoff: 1s, 2s, 4s, 8s, 16s
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET", "POST", "HEAD", "OPTIONS"]
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    
    self.session = requests.Session()
    self.session.headers.update(self.headers)
    self.session.mount("https://", adapter)
    self.session.mount("http://", adapter)
```

### Change 3: New Rate Limit Handler Method
```python
def _handle_rate_limit(self, response: requests.Response) -> None:
    """
    Handle rate limit headers and implement smart backoff.
    """
    remaining = response.headers.get('X-RateLimit-Remaining')
    reset_time = response.headers.get('X-RateLimit-Reset')
    
    if remaining:
        remaining = int(remaining)
        logger.info(f"⏱️  Rate limit: {remaining} requests remaining")
        
        # If approaching limit, add delay
        if remaining < 5:
            delay = 2
            logger.warning(f"⚠️  Approaching rate limit! Waiting {delay}s")
            time.sleep(delay)
    
    if reset_time:
        reset = int(reset_time)
        reset_epoch = reset / 1000 if reset > 10000000000 else reset
        seconds_until_reset = max(0, reset_epoch - time.time())
        if seconds_until_reset > 0:
            logger.info(f"⏱️  Rate limit resets in {seconds_until_reset:.0f}s")
```

### Change 4: Updated API Call Methods
```python
def get_file(self, file_key: str) -> Dict[str, Any]:
    # ... existing code ...
    response = self.session.get(url)
    self._handle_rate_limit(response)  # NEW LINE
    response.raise_for_status()
    return response.json()

def get_file_nodes(self, file_key: str, node_ids: List[str]) -> Dict[str, Any]:
    # ... existing code ...
    response = self.session.get(url, params=params)
    self._handle_rate_limit(response)  # NEW LINE
    response.raise_for_status()
    return response.json()
```

---

## File 2: `backend/app/services/figma_service.py`

### Change 1: Added Time Import
```python
# ADDED:
import time
```

### Change 2: Added Delays Between Page Analysis
```python
async def analyze_from_url(self, figma_url: str, analysis_scope: List[str] = None):
    # ... existing code ...
    
    # Analyze pages
    page_results = []
    for idx, page_data in enumerate(extracted_data["pages"]):
        page_result = await self._analyze_page(
            page_data,
            analysis_scope,
            analysis_id
        )
        page_results.append(page_result)
        
        # NEW CODE - Small delay between pages to avoid rate limiting
        if idx < len(extracted_data["pages"]) - 1:
            time.sleep(0.5)  # 500ms delay
```

---

## Summary of Changes

| Component | Before | After |
|-----------|--------|-------|
| Retries on 429 error | None ❌ | Automatic (up to 5x) ✅ |
| Retry backoff | N/A | 1s → 2s → 4s → 8s → 16s ✅ |
| Rate limit monitoring | None | Checks headers + auto-delay ✅ |
| Request delays | None | 500ms between pages ✅ |
| Error handling | Fails immediately | Smart retry logic ✅ |

---

## How It Protects Your Requests

```
Request sent to Figma API
         ↓
Get response
         ↓
   HTTP 429?
   /        \
  Yes        No → Continue normally ✅
  ↓
Retry with 1s wait
         ↓
   Still 429?
   /        \
  Yes        No → Continue normally ✅
  ↓
Retry with 2s wait
         ↓
   Still 429?
   /        \
  Yes        No → Continue normally ✅
  ↓
...continue up to 5 retries with exponential waits...
         ↓
   Still failing?
   /        \
  Yes        No → Continue normally ✅
  ↓
Fail with error (after 31+ seconds of retries)
```

---

## Testing Recommendations

After deploying these changes, test with:

1. **Small file** (5-10 pages): Should analyze quickly
2. **Medium file** (20-30 pages): Watch for rate limit logs
3. **Large file** (50+ pages): May trigger retry logic

Check logs for:
- `⏱️  Rate limit: X requests remaining`
- `⚠️  Approaching rate limit! Waiting...`
- Successful completions after retries

---

## Deployment Steps

1. ✅ Code changes applied
2. ✅ Syntax verified (no errors)
3. 🔄 **Next**: Restart backend server

To restart:
```bash
# Kill existing backend
pkill -f "python.*app/main.py"

# Or restart normally:
cd backend && python app/main.py
```

---

**Status**: ✅ Code ready  
**Review**: All changes documented  
**Deployment**: Ready
