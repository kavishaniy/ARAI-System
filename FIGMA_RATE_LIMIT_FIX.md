# Figma API Rate Limiting - Fix Applied ✅

## Problem

When analyzing Figma projects, you may encounter:
```
❌ Error
Analysis failed: 429 Client Error: Too Many Requests for url: https://api.figma.com/v1/files/...
```

This happens because the Figma API has rate limits:
- **Community/Free Plan**: 30 requests/minute per user
- **Professional/Organization Plan**: Higher limits but still apply
- **Concurrent requests**: Can be throttled if making multiple simultaneous requests

## Solutions Applied ✅

### 1. **Automatic Retry with Exponential Backoff** 
**File**: `backend/app/core/figma_client.py`

```python
# Implemented using urllib3.Retry strategy
retry_strategy = Retry(
    total=5,              # Retry up to 5 times
    backoff_factor=1,     # Wait 1s, 2s, 4s, 8s, 16s between retries
    status_forcelist=[429, 500, 502, 503, 504],  # HTTP codes to retry on
)
```

**What this does:**
- Automatically retries failed requests with increasing delays
- On 429 error, waits: 1 second → 2 seconds → 4 seconds → 8 seconds → 16 seconds
- Total wait time up to ~31 seconds before failing

### 2. **Rate Limit Header Monitoring**
**File**: `backend/app/core/figma_client.py`

New method `_handle_rate_limit()` checks Figma's response headers:
- `X-RateLimit-Remaining`: How many requests left
- `X-RateLimit-Reset`: When the limit resets

**Smart backoff:** If only <5 requests remain, automatically waits 2 seconds before next request

### 3. **Sequential Page Analysis with Delays**
**File**: `backend/app/services/figma_service.py`

Added 500ms delay between analyzing each page:
```python
# Small delay between page analysis to avoid rate limiting
if idx < len(extracted_data["pages"]) - 1:
    time.sleep(0.5)  # 500ms delay between pages
```

**Why this helps:**
- Spreads out API requests over time
- Prevents multiple simultaneous requests
- Still completes analysis in reasonable time

## How It Works - Example Timeline

**Scenario**: Analyzing a 3-page Figma file

```
Request 1: Get file metadata (t=0s)
         → Check rate limit headers
         → Continue if requests remaining

Wait 500ms

Request 2: Analyze Page 1 (t=0.5s)
         → 100+ frame extractions
         → Retry logic catches any 429 errors
         → Auto-waits if needed

Wait 500ms

Request 3: Analyze Page 2 (t=1.0s)
         → Similar to Page 1

Wait 500ms

Request 4: Analyze Page 3 (t=1.5s)
         → Similar to Pages 1-2

Total time: ~2-5 seconds (depending on file complexity)
```

## When Retries Occur

The system automatically retries on:
1. **HTTP 429** - Too Many Requests (rate limited)
2. **HTTP 500** - Internal Server Error
3. **HTTP 502** - Bad Gateway
4. **HTTP 503** - Service Unavailable
5. **HTTP 504** - Gateway Timeout

Each retry waits longer than the previous:
- 1st retry: 1 second
- 2nd retry: 2 seconds  
- 3rd retry: 4 seconds
- 4th retry: 8 seconds
- 5th retry: 16 seconds
- **Total max wait**: ~31 seconds

## Recommendations

### For Best Results:

1. **Don't analyze multiple files simultaneously**
   - Each analysis counts toward your rate limit
   - Wait for one to complete before starting another

2. **Large files (50+ pages)?**
   - Consider breaking into smaller analysis chunks
   - Or analyze during off-peak hours

3. **Monitoring**
   - Check the backend logs for messages like:
   ```
   ⏱️  Rate limit: 28 requests remaining
   ⚠️  Approaching rate limit! Waiting 2s before next request
   ⏱️  Rate limit resets in 45 seconds
   ```

4. **If still hitting limits**
   - Use a Figma Professional/Organization account (higher limits)
   - Contact Figma support for rate limit increase
   - Implement caching to avoid re-analyzing same files

## Files Modified

| File | Change |
|------|--------|
| `backend/app/core/figma_client.py` | Added retry strategy, rate limit monitoring |
| `backend/app/services/figma_service.py` | Added delays between page analysis |

## Testing the Fix

Try analyzing your project again:
1. Go to the Analyzer tab
2. Paste your Figma project URL
3. Click "Analyze Design"
4. Watch backend logs for rate limit messages
5. Analysis should complete successfully with retries

## Still Getting 429 Errors?

If you continue to see rate limit errors:

1. **Check your Figma account plan**
   - Free plan has lowest limits
   - Upgrade to Professional for higher limits

2. **Wait and retry**
   - Manual retry after 1-2 minutes often works
   - The error message shows the limit should reset

3. **Reduce file complexity**
   - Large files with 100+ frames use more requests
   - Try analyzing simpler files first

4. **Check logs for details**
   ```bash
   # View backend logs
   tail -f backend.log
   ```

## Technical Details

### Why 429 Errors Happen

Each Figma API request counts toward the limit:
- Getting file data: 1 request
- Getting component data: 1 request per component set
- Getting node details: 1 request per 100 nodes

A complex file with 50 pages × 10 frames × 5 components = 2,500+ potential requests

### How Retry Strategy Helps

Instead of failing on first 429:
- **Without fix**: Instant failure ❌
- **With fix**: Waits and retries up to 5 times ✅

The exponential backoff gives the API time to reset your quota.

## Support

If you continue experiencing issues:
1. Check the **COMPLETE_SETUP_GUIDE.md** for general setup
2. Review **FIGMA_IMPLEMENTATION_SUMMARY.md** for architecture
3. Contact system administrators with error logs from: `backend.log`

---

**Status**: ✅ Rate limiting protection enabled
**Last Updated**: 2026-04-15
**Affects**: All Figma analysis operations
