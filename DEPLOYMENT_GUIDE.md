# Performance Optimization Deployment Guide

## 🚀 Quick Deployment (3 Steps)

### Step 1: Update Dependencies
```bash
cd backend
pip install -r requirements.txt
# Should already include: asyncio, PIL, aiohttp (if needed)
```

### Step 2: Deploy Updated Code
```bash
# All changes are already in place:
# - backend/app/core/figma_optimization.py (NEW)
# - backend/app/services/figma_service.py (UPDATED)
# - backend/tests/test_optimization.py (NEW)

# No breaking changes - fully backward compatible!
```

### Step 3: Verify Deployment
```bash
# Start backend
./start_backend.sh

# Test in logs (look for):
# - "[analysis_id] 🚀 Starting optimized Figma analysis"
# - "[analysis_id] 📊 Performance Report:"
# - "[analysis_id] ✅ Analysis completed in X.XXs"
```

## 📦 What Changed

### New Files (Safe to Deploy)
- `backend/app/core/figma_optimization.py` - 450+ lines of optimization code
- `backend/tests/test_optimization.py` - 250+ lines of tests

### Modified Files (Backward Compatible)
- `backend/app/services/figma_service.py` - Added optional optimization, kept old methods

### No Changes Needed
- Frontend code - Works with updated backend
- API contracts - Response format unchanged
- Configuration - Works with defaults

## ✅ Pre-Deployment Checklist

- [ ] Review `backend/app/core/figma_optimization.py`
- [ ] Verify `backend/app/services/figma_service.py` changes
- [ ] Run tests: `pytest backend/tests/test_optimization.py`
- [ ] Test with real Figma file
- [ ] Check logs for optimization messages
- [ ] Verify cache hits on repeated analyses

## 🧪 Testing Before Production

### 1. Unit Tests
```bash
cd backend
pytest tests/test_optimization.py -v

# Expected output:
# test_filter_hidden_frames PASSED
# test_filter_components PASSED
# test_limit_max_frames PASSED
# test_cache_set_and_get PASSED
# ... (etc)
```

### 2. Integration Test
```python
# backend/test_live_optimization.py
import asyncio
from app.services.figma_service import FigmaAnalysisService
import time

async def test():
    service = FigmaAnalysisService()
    
    # Test with your Figma file
    url = "https://www.figma.com/file/YOUR_FILE_ID/YOUR_FILE"
    
    # First analysis (full)
    print("Running first analysis...")
    start = time.time()
    result1 = await service.analyze_from_url(url)
    t1 = time.time() - start
    print(f"First: {t1:.1f}s ({result1.total_frames} frames)")
    
    # Second analysis (cached)
    print("Running cached analysis...")
    start = time.time()
    result2 = await service.analyze_from_url(url)
    t2 = time.time() - start
    print(f"Cached: {t2:.1f}s")
    
    # Verify optimization
    if t2 < 1.0 and t1 > 10:
        speedup = t1 / t2
        print(f"✅ SUCCESS: {speedup:.0f}x speedup (expected >10x)")
    else:
        print(f"⚠️ Check optimization (first={t1:.1f}s, cached={t2:.1f}s)")

asyncio.run(test())
```

### 3. Performance Validation
Check logs for these signs of success:

```
✅ Good Signs:
[analysis_id] 🚀 Starting optimized Figma analysis      # Optimization active
[analysis_id] 💾 Cache MISS for abc123                 # First request
[analysis_id] ⏱️ analysis_complete: 10.5s               # Under 15s for small file
[analysis_id] 💾 Cache HIT for abc123                  # Cache working
[analysis_id] ✅ Analysis completed in 10.60s (5 frames)

❌ Problem Signs:
[analysis_id] Starting Figma analysis from URL          # Old code running
[analysis_id] Analysis completed in 35.00s (20 frames)  # Too slow
[analysis_id] 📊 Frame filtering: analyzing 50/50 frames # Not filtering
```

## 🔧 Configuration for Different Environments

### Development
```python
# backend/app/main.py or config.py
from app.core.figma_optimization import OptimizationConfig

DEV_OPTIMIZATION_CONFIG = OptimizationConfig(
    max_frames_per_analysis=20,
    enable_cache=False,  # Disable cache for testing
    enable_metrics=True  # Enable detailed logs
)
```

### Staging
```python
STAGING_OPTIMIZATION_CONFIG = OptimizationConfig(
    max_frames_per_analysis=20,
    enable_cache=True,        # Enable caching
    cache_ttl_hours=1,
    enable_metrics=True       # Monitor performance
)
```

### Production
```python
PRODUCTION_OPTIMIZATION_CONFIG = OptimizationConfig(
    max_frames_per_analysis=20,
    enable_cache=True,        # Cache for speed
    cache_ttl_hours=4,        # Longer cache TTL
    max_concurrent_analyses=3,
    enable_metrics=False      # Disable detailed logging for performance
)
```

## 📊 Monitoring in Production

### Key Metrics to Track

1. **Processing Time**
```python
# From API response
response.processing_time_seconds

# Alert if:
# - > 35 seconds (should be <30)
# - > 5 seconds for cached (should be <1)
```

2. **Cache Hit Rate**
```python
# Count in logs:
# (# Cache HIT) / (total analyses)
# Target: > 70%
```

3. **Frame Count Analyzed**
```python
# From response
response.total_frames

# Should be:
# - Always <= max_frames_per_analysis
# - Typically 5-20 depending on file
```

### Logging Setup

```python
# backend/app/logging_config.py
import logging

logger = logging.getLogger("figma_optimization")
logger.setLevel(logging.INFO)

# Log handler to file for analysis
handler = logging.FileHandler("figma_optimization.log")
formatter = logging.Formatter(
    '[%(name)s] %(asctime)s - %(levelname)s - %(message)s'
)
handler.setFormatter(formatter)
logger.addHandler(handler)
```

### Sample Monitoring Dashboard

```
Figma Analysis Performance Dashboard
====================================

Last Hour Statistics:
- Total analyses: 42
- Cache hits: 31 (74%)
- Avg processing time (fresh): 18.2s
- Avg processing time (cached): 0.3s
- Avg frames analyzed: 12

Performance by File Size:
- <5MB (12 files): avg 12s, cache hit 85%
- 5-10MB (18 files): avg 20s, cache hit 72%
- >10MB (5 files): avg 26s, cache hit 40%

Alerts:
⚠️ 2 analyses exceeded 35s (check large files)
✅ Cache hit rate healthy at 74%
✅ No timeouts detected
```

## 🚨 Troubleshooting Deployment

### Issue: Old logs still showing
**Cause:** Python cache not cleared
```bash
# Clear Python cache
find . -type d -name __pycache__ -exec rm -r {} +
rm -rf backend/*.pyc

# Restart app
./start_backend.sh
```

### Issue: Cache not working
**Cause:** Cache disabled or not hit
```bash
# Check config:
logger.info(f"Cache enabled: {service.optimizer.config.enable_cache}")

# Should see in logs:
[analysis_id] 💾 Cache HIT for abc123  # On second request

# If not hitting, clear and retry:
FigmaAnalysisCache.clear()
```

### Issue: Performance not improved
**Cause:** May be network/Figma API limits
```bash
# Check bottleneck in logs:
[analysis_id] ⏱️ extraction_complete: 15.2s  # Slow API
[analysis_id] ⏱️ analysis_complete: 8.5s     # Fast analysis

# If API is slow:
- Check Figma API status
- Check network latency
- Reduce max_frames_per_analysis
```

## 📈 Rollback Plan

If issues occur:

### Option 1: Disable Optimization (Keep Code)
```python
# backend/app/main.py
config = OptimizationConfig(
    enable_cache=False,
    max_frames_per_analysis=100,  # Unlimited
    max_concurrent_analyses=1      # Sequential
)
```

### Option 2: Revert Code Changes
```bash
git checkout backend/app/services/figma_service.py
# Removes optimization, uses old sequential code
```

### Option 3: Full Rollback
```bash
git revert [commit_hash]
# Fully reverts to previous version
```

## ✨ Post-Deployment Validation

### 24-Hour Checks
- [ ] Check error logs for exceptions
- [ ] Monitor processing_time_seconds trend
- [ ] Verify cache hit rate >50%
- [ ] Confirm no timeout increases

### 1-Week Checks
- [ ] Cache hit rate should be >70%
- [ ] Processing time stable (<30s)
- [ ] No memory leaks in logs
- [ ] User feedback positive

### 1-Month Checks
- [ ] Consistent performance
- [ ] Update monitoring thresholds
- [ ] Plan Redis migration if needed
- [ ] Analyze cache patterns

## 📋 Deployment Checklist

```
Pre-Deployment
- [ ] Code review complete
- [ ] Unit tests passing
- [ ] Integration test passed
- [ ] Documentation updated
- [ ] Team notified

Deployment
- [ ] Deploy new code
- [ ] Run basic health check
- [ ] Monitor logs for errors
- [ ] Check performance metrics

Post-Deployment
- [ ] 24-hour monitoring complete
- [ ] No errors in logs
- [ ] Performance meets targets
- [ ] Team validated in staging
- [ ] Document any issues found
```

## 📞 Support

### Questions?
See documentation:
- **Quick Start:** OPTIMIZATION_QUICK_REFERENCE.md
- **Implementation:** OPTIMIZATION_IMPLEMENTATION.md
- **Performance:** FIGMA_PERFORMANCE_OPTIMIZATION.md

### Issues?
1. Check logs for "[analysis_id]" messages
2. Compare with examples in OPTIMIZATION_IMPLEMENTATION.md
3. Verify configuration in OptimizationConfig
4. Test with test_optimization.py

### Performance Concerns?
1. Monitor processing_time_seconds
2. Check cache hit rate in logs
3. Verify max_frames_per_analysis
4. Consider Redis migration for scale

---

**Deployment Ready:** ✅ YES
**Risk Level:** 🟢 LOW (Backward compatible, optional feature)
**Estimated Downtime:** < 5 minutes
**Rollback Time:** < 2 minutes
