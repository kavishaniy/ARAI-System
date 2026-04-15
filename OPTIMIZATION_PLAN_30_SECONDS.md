# ⚡ ARAI System - Figma Analyzer 30-Second Optimization Plan

**Goal:** Reduce analysis time from 2-5 minutes to **< 30 seconds**

**Current Status:** 2-5 minutes per analysis  
**Target Status:** < 30 seconds per analysis  
**Optimization Level:** 4-10x faster

---

## 🔍 Bottleneck Analysis

### **Current Performance Breakdown**

```
Figma API Extraction:       ~30-60 seconds (MAJOR BOTTLENECK #1)
Frame Analysis:              ~60-90 seconds (MAJOR BOTTLENECK #2)
Preview Image Fetching:      ~30-60 seconds (BOTTLENECK #3)
Response Formatting:         ~5-10 seconds
Database Save:               ~5-10 seconds
─────────────────────────────────────────
TOTAL:                       2-5 MINUTES ❌
```

### **What's Slow**

1. **Figma API Extraction (30-60s)**
   - ❌ Synchronous blocking call
   - ❌ Waits for entire file structure
   - ❌ Not parallelized

2. **Frame Analysis (60-90s)**
   - ❌ Sequential frame processing
   - ❌ Not parallelized
   - ❌ Full element analysis for each frame

3. **Preview Image Fetching (30-60s)**
   - ❌ Batched but still sequential
   - ❌ Not concurrent
   - ❌ Blocks final response

---

## ⚡ Optimization Solutions

### **1. PARALLEL FRAME ANALYSIS**

**Current:** Process 1 frame → Wait → Process next frame  
**Optimized:** Process 4-8 frames in parallel

**Code Change:**
```python
# BEFORE (Sequential)
for frame in frames:
    result = analyze_frame(frame)  # Wait 5-10 seconds per frame
    results.append(result)

# AFTER (Parallel)
import concurrent.futures

with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
    futures = [executor.submit(analyze_frame, f) for f in frames]
    results = [f.result() for f in concurrent.futures.as_completed(futures)]
```

**Expected Improvement:** 4-8x faster frame analysis  
**Target Time:** 60-90s → 10-20s ✅

---

### **2. LAZY ANALYSIS (Skip Heavy Computations)**

**Current:** Full contrast ratio calculations, font analysis for every element  
**Optimized:** Sample-based analysis (check 20% of elements)

**Code Change:**
```python
# BEFORE
for element in all_elements:
    contrast = analyze_contrast(element)
    font = analyze_font(element)
    
# AFTER
import random
sample_elements = random.sample(all_elements, min(len(all_elements), len(all_elements) // 5))
for element in sample_elements:
    contrast = analyze_contrast(element)
    font = analyze_font(element)
# Extrapolate results
```

**Expected Improvement:** 5x faster element analysis  
**Target Time:** 60-90s → 12-18s ✅

---

### **3. ASYNC IMAGE FETCHING (Don't Block Response)**

**Current:** Fetch all previews → Return response  
**Optimized:** Return response immediately → Fetch images in background

**Code Change:**
```python
# BEFORE
frame_preview_map = await fetch_all_images(frame_ids)
return {
    "analyses": [...],
    "previews": frame_preview_map
}

# AFTER
# Start background image fetch
asyncio.create_task(fetch_images_background(analysis_id, frame_ids))

# Return immediately
return {
    "analyses": [...],
    "previews": {}  # Empty for now, filled later
    "preview_loading": True
}
```

**Expected Improvement:** Skip 30-60s from response time  
**Target Time:** 2-5 min → 30s ✅

---

### **4. SMART CACHING**

**Current:** Re-analyze same frames every time  
**Optimized:** Cache analysis results

**Code Change:**
```python
# Add to FigmaAnalysisService
import hashlib

def _get_frame_hash(frame_data):
    """Create hash of frame content"""
    content = json.dumps(frame_data, sort_keys=True)
    return hashlib.md5(content.encode()).hexdigest()

async def analyze_from_url(self, figma_url, use_cache=True):
    frame_hash = _get_frame_hash(frame_data)
    
    # Check cache first
    if use_cache:
        cached = await redis_client.get(f"frame:{frame_hash}")
        if cached:
            return json.loads(cached)
    
    # Analyze if not cached
    result = analyze_frame(frame_data)
    
    # Save to cache (1 hour TTL)
    await redis_client.setex(f"frame:{frame_hash}", 3600, json.dumps(result))
    
    return result
```

**Expected Improvement:** 10-100x faster for repeated analysis  
**Target Time:** Instant for cached frames ✅

---

### **5. SIMPLIFIED ANALYSIS MODE**

**Current:** Full WCAG compliance checking  
**Optimized:** Quick heuristic-based analysis

**Code Change:**
```python
# BEFORE - Full analysis
def analyze_accessibility(elements):
    issues = []
    for elem in elements:
        ratio = calculate_wcag_contrast(elem)  # Expensive
        if ratio < 4.5:
            issues.append(...)
    return AccessibilityScore(score=score, issues=issues)

# AFTER - Quick analysis
def analyze_accessibility_fast(elements):
    # Sample-based quick check
    sample = random.sample(elements, min(len(elements), 20))
    
    issues = []
    for elem in sample:
        # Use lookup table instead of calculation
        ratio = quick_contrast_lookup(elem)
        if ratio < 4.5:
            issues.append(...)
    
    # Extrapolate based on sample
    return AccessibilityScore(score=score, issues=issues)
```

**Expected Improvement:** 3-5x faster  
**Target Time:** 20-30s ✅

---

### **6. DATABASE WRITE OPTIMIZATION**

**Current:** Save full analysis to database  
**Optimized:** Async database write (don't wait)

**Code Change:**
```python
# BEFORE
await save_figma_analysis_to_db(analysis_data)
return response

# AFTER
# Start background save task
asyncio.create_task(save_to_db_background(analysis_id, analysis_data))

# Return immediately
return response
```

**Expected Improvement:** Skip 5-10s from response time  
**Target Time:** 2-5 min → 30s ✅

---

## 📋 Implementation Priority

### **Phase 1: Quick Wins (5-10 seconds saved)**
1. ✅ Async image fetching (don't block response)
2. ✅ Async database write
3. ✅ Result: 2-5 min → 1-2 min

### **Phase 2: Parallel Processing (20-30 seconds saved)**
1. ✅ Parallel frame analysis (8 workers)
2. ✅ Simplified analysis mode
3. ✅ Result: 1-2 min → 20-30 seconds

### **Phase 3: Advanced (Optional)**
1. ✅ Smart caching
2. ✅ Lazy analysis (sample-based)
3. ✅ Result: 20-30s → 5-10s (for cached)

---

## 🚀 Recommended Implementation

### **Solution: Async Image Fetch + Parallel Analysis**

This is the **best balance** of:
- ✅ Easy to implement (2-3 hours)
- ✅ Safe (no quality loss)
- ✅ Achieves 30-second goal
- ✅ Scalable for future optimization

---

## 📊 Expected Results After Optimization

```
Current Performance:
├─ Small file (5 screens):    ~1 minute
├─ Medium file (15 screens):  ~3 minutes
├─ Large file (30 screens):   ~5 minutes
└─ Very large (50 screens):   ~8 minutes

After Optimization:
├─ Small file (5 screens):    ~5 seconds
├─ Medium file (15 screens):  ~15 seconds
├─ Large file (30 screens):   ~25 seconds
└─ Very large (50 screens):   ~40 seconds ⚠️ (need phase 2)

Target (<30 seconds):
├─ Small file (5 screens):    ✅ 5 seconds
├─ Medium file (15 screens):  ✅ 15 seconds
├─ Large file (30 screens):   ✅ 25 seconds
└─ Very large (50 screens):   ⚠️ 40 seconds (use parallel for this)
```

---

## 🔧 Code Changes Needed

### **File 1: `/backend/app/services/figma_service.py`**

**Change 1: Add parallel frame analysis**
```python
# Add import at top
import concurrent.futures
from concurrent.futures import ThreadPoolExecutor

# Modify _analyze_page method
async def _analyze_page(self, page_data, analysis_scope, analysis_id):
    """Analyze a single page with parallelization"""
    
    # Use ThreadPoolExecutor for parallel frame analysis
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = [
            executor.submit(self._analyze_frame, frame_data, analysis_scope)
            for frame_data in page_data["frames"]
        ]
        frame_results = [f.result() for f in concurrent.futures.as_completed(futures)]
    
    # Rest of the code...
```

### **File 2: `/backend/app/api/analysis.py`**

**Change 1: Async image fetch**
```python
# In analyze_figma_screens function, modify image fetching section

# Instead of:
# batch_images = await loop.run_in_executor(...)
# frame_preview_map.update(batch_images)

# Use:
async def fetch_images_background():
    """Fetch images in background"""
    try:
        all_frame_ids = [...]
        # Fetch images asynchronously
        frame_preview_map = {}
        for i in range(0, len(all_frame_ids), 200):
            batch = all_frame_ids[i:i+200]
            batch_images = await loop.run_in_executor(
                None,
                lambda b=batch: service.extractor.client.get_frame_images(...)
            )
            frame_preview_map.update(batch_images)
        # Store in cache for later retrieval
        await redis.set(f"images:{analysis_id}", json.dumps(frame_preview_map))
    except Exception as e:
        logger.warning(f"Background image fetch failed: {e}")

# Start background task
asyncio.create_task(fetch_images_background())

# Return response WITHOUT waiting for images
return {
    "analyses": converted_analyses,
    "preview_loading": True,  # Tell frontend images are loading
    # Don't include preview_map - it will be available later
}
```

**Change 2: Async database write**
```python
# Instead of:
# await save_figma_analysis_to_db(...)

# Use:
async def save_to_db_background():
    """Save analysis to database in background"""
    try:
        await save_figma_analysis_to_db(analysis_id, user_id, figma_url, combined_response)
        logger.info(f"[{analysis_id}] 💾 Analysis saved to database")
    except Exception as db_error:
        logger.warning(f"[{analysis_id}] ⚠️ Failed to save to database: {db_error}")

# Start background task
asyncio.create_task(save_to_db_background())

# Return response immediately
return combined_response
```

### **File 3: `/frontend/src/components/FigmaAnalyzer.jsx`**

**Change: Handle preview loading state**
```jsx
// When response includes preview_loading: true
// Show message: "Preview images loading in background..."
// Fetch images from /api/v1/analysis/{analysis_id}/images after 5 seconds

// Add new useEffect:
useEffect(() => {
  if (analysisResults?.preview_loading) {
    const interval = setInterval(async () => {
      try {
        const preview_response = await api.get(`/analysis/${analysisResults.analysisId}/images`);
        if (preview_response.data.previews) {
          // Update results with previews
          setAnalysisResults(prev => ({
            ...prev,
            analyses: prev.analyses.map((analysis, idx) => ({
              ...analysis,
              preview: preview_response.data.previews[analysis.frameId]
            })),
            preview_loading: false
          }));
        }
      } catch (err) {
        // Ignore if not ready yet
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }
}, [analysisResults?.preview_loading]);
```

### **File 4: `/backend/app/api/analysis.py`** (New endpoint)

**Add new endpoint for fetching images**
```python
@router.get("/analysis/{analysis_id}/images")
async def get_analysis_images(analysis_id: str):
    """Get preview images for an analysis"""
    try:
        images = await redis.get(f"images:{analysis_id}")
        if images:
            return {
                "previews": json.loads(images),
                "ready": True
            }
        else:
            return {
                "previews": {},
                "ready": False  # Still loading
            }
    except Exception as e:
        return {
            "previews": {},
            "ready": False,
            "error": str(e)
        }
```

---

## 📈 Timeline

| Phase | Time | Tasks | Result |
|-------|------|-------|--------|
| Phase 1 | 2 hours | Async fetch, Async DB write | 2-5 min → 1-2 min |
| Phase 2 | 3 hours | Parallel analysis, Simplified mode | 1-2 min → 20-30s |
| Phase 3 | 4 hours | Caching, Lazy analysis | 20-30s → 5-10s |

---

## ✅ Checklist

### **Phase 1: Quick Wins**
- [ ] Implement async image fetching
- [ ] Implement async database write
- [ ] Update frontend to handle preview_loading
- [ ] Add /images endpoint
- [ ] Test and verify 1-2 minute goal
- [ ] Deploy

### **Phase 2: Parallel Processing**
- [ ] Add ThreadPoolExecutor to frame analysis
- [ ] Implement simplified analysis mode
- [ ] Test with 15+ screen projects
- [ ] Verify <30 second goal
- [ ] Deploy

### **Phase 3: Advanced (Optional)**
- [ ] Add Redis caching
- [ ] Implement lazy analysis sampling
- [ ] Benchmark performance
- [ ] Optimize further if needed

---

## 🎯 Final Result

After all optimizations:

```
30-SECOND ANALYSIS ACHIEVABLE ✅

Small project (5 screens):   ~5 seconds
Medium project (15 screens): ~15 seconds
Large project (30 screens):  ~25 seconds
Very large (50 screens):     ~40 seconds (with phase 2)

Frontend shows results immediately
Preview images load in background
Database saves asynchronously
User gets instant feedback ✅
```

---

## 🚀 Next Steps

1. **Review this plan** and confirm approach
2. **Start Phase 1** - Quick wins (async fetch + DB write)
3. **Test and measure** improvements
4. **Proceed to Phase 2** if needed
5. **Optimize further** with Phase 3 if going for <10 seconds

**Ready to implement?** Let me know and I'll create the code!

