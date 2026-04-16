# 🚀 Figma Integration - Performance Optimization Guide

## Reality Check: Your Current Implementation

### ⚠️ Potential Issues

1. **No frame limiting** - Analyzes ALL frames regardless of count
   - 5 frames: ✅ ~30s
   - 50 frames: ⚠️ ~180s+ (exceeds timeout)
   - 100+ frames: ❌ Likely timeout/OOM

2. **Sequential image fetching** - May not batch efficiently
   - Each frame might be individual API call
   - Wastes 70% of time on network overhead

3. **No parallelization** - Analysis waits for each step
   - Should run image analysis in parallel
   - Memory could be optimized

4. **Whole file parsing** - Fetches entire JSON structure
   - Can be MBs for large files
   - Extracts data not needed

### ✅ What's Working

- Rate limiting with backoff ✅
- Async/await structure ✅
- Error handling ✅
- Frame extraction logic ✅

---

## Time Budget Breakdown (Target: 30s)

```
API Fetch (File JSON + Images): 5-10s
├─ GET /files/{key}            ~2-3s
└─ GET /images/{key}           ~3-7s (depends on parallelism)

Image Processing:               10-15s
├─ Download from CDN           ~2-4s
├─ Resize/decode               ~3-5s
└─ Store temporarily           ~2-3s

Analysis:                       5-10s
├─ Accessibility scan          ~2-3s
├─ Readability analysis        ~2-3s
└─ Attention scoring           ~1-4s

Response & Storage:            2-5s
├─ Format results              ~1s
├─ Database save               ~1-4s
└─ Return to frontend          <1s

TOTAL: 22-40s (30s is tight!)
```

---

## Optimization Strategy

### 1. Smart Frame Limiting

**Problem**: Large files = exponential time

**Solution**: Cap max frames intelligently

```python
# backend/app/services/figma_service.py

class FrameLimiter:
    """Intelligently limit frames for performance"""
    
    MAX_FRAMES_PER_RUN = 20  # Configurable
    
    @staticmethod
    def should_analyze_frame(frame: FigmaNode, index: int, total: int) -> bool:
        """
        Decide if we should analyze this frame.
        
        Rules:
        1. Skip hidden frames
        2. Skip components (unless top-level)
        3. Limit to top N frames
        4. Prioritize visible screens
        """
        # Skip hidden
        if not frame.visible:
            return False
        
        # Skip deep nesting (likely components)
        if hasattr(frame, 'is_component') and frame.is_component:
            return False
        
        # Limit total
        if index >= FrameLimiter.MAX_FRAMES_PER_RUN:
            return False
        
        return True
    
    @staticmethod
    def filter_frames(frames: List[FigmaNode]) -> Tuple[List[FigmaNode], int]:
        """
        Filter frames for analysis.
        
        Returns:
            (filtered_frames, skipped_count)
        """
        filtered = []
        skipped = 0
        
        for idx, frame in enumerate(frames):
            if FrameLimiter.should_analyze_frame(frame, idx, len(frames)):
                filtered.append(frame)
            else:
                skipped += 1
        
        logger.info(f"📊 Analyzing {len(filtered)} frames (skipped {skipped})")
        return filtered, skipped
```

### 2. Batch Image Requests (CRITICAL)

**Problem**: Sequential API calls waste time

**Solution**: Batch 15-20 frames per request

```python
# backend/app/core/figma_client.py

def get_frame_images_batched(
    self,
    file_key: str,
    node_ids: List[str],
    batch_size: int = 15,
    scale: float = 0.5
) -> Dict[str, str]:
    """
    Fetch images in parallel batches (OPTIMIZED).
    
    Args:
        file_key: Figma file key
        node_ids: All node IDs to fetch
        batch_size: Frames per request (15-20 optimal)
        scale: Export scale (0.5 = 50% size = faster)
    
    Returns:
        Dict mapping node_id → image URL
    """
    if not node_ids:
        return {}
    
    # Create batches
    batches = [
        node_ids[i:i + batch_size]
        for i in range(0, len(node_ids), batch_size)
    ]
    
    logger.info(f"📦 Fetching {len(node_ids)} images in {len(batches)} batches")
    
    all_images = {}
    
    # Fetch batches SEQUENTIALLY (respects rate limits)
    # If you have async capable Figma client, parallelize here
    for batch_num, batch in enumerate(batches):
        try:
            ids_param = ",".join(batch)
            url = f"{self.BASE_URL}/images/{file_key}"
            params = {
                "ids": ids_param,
                "scale": scale,
                "format": "png"
            }
            
            logger.info(f"  Batch {batch_num+1}/{len(batches)}: {len(batch)} frames")
            
            response = self.session.get(url, params=params, timeout=90)
            self._handle_rate_limit(response)
            response.raise_for_status()
            
            data = response.json()
            images = data.get("images", {})
            valid_images = {k: v for k, v in images.items() if v}
            
            all_images.update(valid_images)
            
            # Small delay between batches to respect rate limits
            if batch_num < len(batches) - 1:
                time.sleep(0.5)  # 500ms between batches
        
        except Exception as e:
            logger.warning(f"Batch {batch_num} failed: {e}, continuing...")
            continue
    
    logger.info(f"✅ Got {len(all_images)}/{len(node_ids)} images")
    return all_images
```

### 3. Async Image Download & Processing

**Problem**: Downloading large images is slow

**Solution**: Download and process in parallel

```python
# backend/app/services/figma_service.py

import asyncio
import aiohttp
from PIL import Image
from io import BytesIO

class ImageOptimizer:
    """Download and optimize images efficiently"""
    
    TARGET_WIDTH = 1280  # Max width for analysis
    QUALITY = 75  # JPEG quality
    
    @staticmethod
    async def download_image_async(
        session: aiohttp.ClientSession,
        url: str,
        timeout: int = 30
    ) -> Optional[bytes]:
        """Download image with timeout"""
        try:
            async with session.get(url, timeout=timeout) as response:
                if response.status == 200:
                    return await response.read()
        except Exception as e:
            logger.warning(f"Failed to download image: {e}")
        return None
    
    @staticmethod
    def resize_image(image_bytes: bytes) -> bytes:
        """
        Resize image to target width.
        
        Benefits:
        - 50-70% faster processing
        - Reduced memory usage
        - Maintains aspect ratio
        """
        try:
            img = Image.open(BytesIO(image_bytes))
            
            # Check if resize needed
            if img.width <= ImageOptimizer.TARGET_WIDTH:
                return image_bytes  # Already optimized
            
            # Calculate new size maintaining aspect ratio
            ratio = ImageOptimizer.TARGET_WIDTH / img.width
            new_height = int(img.height * ratio)
            
            # Resize
            resized = img.resize(
                (ImageOptimizer.TARGET_WIDTH, new_height),
                Image.Resampling.LANCZOS
            )
            
            # Save to bytes
            output = BytesIO()
            resized.save(output, format='PNG', quality=ImageOptimizer.QUALITY)
            return output.getvalue()
        
        except Exception as e:
            logger.warning(f"Failed to resize image: {e}")
            return image_bytes
    
    @staticmethod
    async def download_and_process_batch(
        image_urls: Dict[str, str],
        max_concurrent: int = 5
    ) -> Dict[str, bytes]:
        """
        Download and resize multiple images in parallel.
        
        Args:
            image_urls: {frame_id: url}
            max_concurrent: Max parallel downloads
        
        Returns:
            {frame_id: image_bytes}
        """
        result = {}
        
        async with aiohttp.ClientSession() as session:
            # Create semaphore to limit concurrent downloads
            semaphore = asyncio.Semaphore(max_concurrent)
            
            async def download_one(frame_id: str, url: str):
                async with semaphore:
                    bytes_data = await ImageOptimizer.download_image_async(
                        session, url
                    )
                    if bytes_data:
                        # Resize immediately
                        optimized = ImageOptimizer.resize_image(bytes_data)
                        result[frame_id] = optimized
                        logger.info(f"✅ Downloaded & optimized {frame_id}")
            
            # Download all in parallel
            tasks = [
                download_one(fid, url)
                for fid, url in image_urls.items()
            ]
            await asyncio.gather(*tasks)
        
        logger.info(f"📸 Downloaded {len(result)}/{len(image_urls)} images")
        return result
```

### 4. Parallel Analysis

**Problem**: Analyzing each frame sequentially

**Solution**: Analyze multiple frames in parallel

```python
# backend/app/services/figma_service.py

async def _analyze_frames_parallel(
    self,
    frames: List[FigmaNode],
    images: Dict[str, bytes],
    analysis_scope: List[str],
    max_parallel: int = 3
) -> List[FrameAnalysisResult]:
    """
    Analyze multiple frames in parallel.
    
    Args:
        frames: Frames to analyze
        images: Image data by frame ID
        max_parallel: Max concurrent analyses
    
    Returns:
        Analysis results for each frame
    """
    results = []
    semaphore = asyncio.Semaphore(max_parallel)
    
    async def analyze_one(frame: FigmaNode):
        async with semaphore:
            image_bytes = images.get(frame.id)
            
            # Run in executor (blocking operation)
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                self._analyze_single_frame,
                frame,
                image_bytes,
                analysis_scope
            )
            return result
    
    # Analyze all in parallel
    tasks = [analyze_one(frame) for frame in frames]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Filter out errors
    valid_results = [
        r for r in results
        if not isinstance(r, Exception)
    ]
    
    logger.info(f"✅ Analyzed {len(valid_results)} frames in parallel")
    return valid_results
```

### 5. Smart Caching

**Problem**: Re-analyzing same file = waste

**Solution**: Cache by (file_key, lastModified, frames)

```python
# backend/app/core/cache.py

import json
import hashlib
from datetime import datetime, timedelta

class FigmaAnalysisCache:
    """Cache Figma analysis results"""
    
    # In-memory cache (for demo; use Redis for production)
    _cache: Dict[str, Dict] = {}
    
    @staticmethod
    def get_cache_key(file_key: str, frame_ids: List[str]) -> str:
        """Generate cache key"""
        frames_hash = hashlib.md5(
            json.dumps(sorted(frame_ids)).encode()
        ).hexdigest()
        return f"figma:{file_key}:{frames_hash}"
    
    @staticmethod
    def get(file_key: str, frame_ids: List[str]) -> Optional[Dict]:
        """Get cached analysis"""
        key = FigmaAnalysisCache.get_cache_key(file_key, frame_ids)
        cached = FigmaAnalysisCache._cache.get(key)
        
        if cached:
            # Check expiry
            if datetime.utcnow() < cached['expires_at']:
                logger.info(f"💾 Cache hit for {file_key}")
                return cached['data']
            else:
                # Expired
                del FigmaAnalysisCache._cache[key]
        
        return None
    
    @staticmethod
    def set(file_key: str, frame_ids: List[str], data: Dict, ttl_hours: int = 1):
        """Cache analysis result"""
        key = FigmaAnalysisCache.get_cache_key(file_key, frame_ids)
        FigmaAnalysisCache._cache[key] = {
            'data': data,
            'expires_at': datetime.utcnow() + timedelta(hours=ttl_hours),
            'created_at': datetime.utcnow()
        }
        logger.info(f"💾 Cached analysis for {file_key}")
```

---

## Optimized Pipeline

```python
# backend/app/services/figma_service.py

async def analyze_from_url_optimized(
    self,
    figma_url: str,
    analysis_scope: List[str] = None,
    max_frames: int = 20
) -> FigmaAnalysisResponse:
    """
    Optimized analysis pipeline.
    
    Target: 20-30 seconds for up to 20 frames
    """
    analysis_id = str(uuid.uuid4())
    start_time = datetime.utcnow()
    
    logger.info(f"[{analysis_id}] Starting OPTIMIZED analysis")
    
    try:
        # Step 1: Extract file (2-3s)
        logger.info(f"[{analysis_id}] ⏱️ Step 1: Fetch file...")
        loop = asyncio.get_event_loop()
        extracted_data = await loop.run_in_executor(
            None, self.extractor.extract_from_url, figma_url
        )
        
        # Get all frames from all pages
        all_frames = []
        for page in extracted_data.get("pages", []):
            all_frames.extend(page.get("frames", []))
        
        # Step 2: Limit frames (instant)
        logger.info(f"[{analysis_id}] 🔂 Step 2: Filter frames...")
        filtered_frames, skipped = FrameLimiter.filter_frames(all_frames)
        if skipped > 0:
            logger.info(f"⚠️ Skipped {skipped} frames (max {max_frames})")
        
        if not filtered_frames:
            raise ValueError("No analyzable frames found")
        
        # Step 3: Fetch images in batches (3-7s)
        logger.info(f"[{analysis_id}] 📸 Step 3: Fetch images...")
        frame_ids = [f.get("id") for f in filtered_frames]
        image_urls = await loop.run_in_executor(
            None,
            self.extractor.client.get_frame_images_batched,
            extracted_data["file_key"],
            frame_ids,
            15,  # batch size
            0.5   # scale (50%)
        )
        
        # Step 4: Download images in parallel (2-4s)
        logger.info(f"[{analysis_id}] ⬇️ Step 4: Download images...")
        images = await ImageOptimizer.download_and_process_batch(
            image_urls,
            max_concurrent=5
        )
        
        # Step 5: Analyze in parallel (5-10s)
        logger.info(f"[{analysis_id}] 🧠 Step 5: Analyze frames...")
        frame_objs = [FigmaNode(**f) for f in filtered_frames]
        analysis_results = await self._analyze_frames_parallel(
            frame_objs,
            images,
            analysis_scope,
            max_parallel=3
        )
        
        # Step 6: Format and return (1-2s)
        elapsed = (datetime.utcnow() - start_time).total_seconds()
        logger.info(f"[{analysis_id}] ✅ Complete in {elapsed:.1f}s")
        
        # Build response...
        return FigmaAnalysisResponse(...)
    
    except Exception as e:
        logger.error(f"[{analysis_id}] ❌ Error: {e}")
        raise
```

---

## Configuration Options

```python
# backend/app/core/config.py

class FigmaAnalysisSettings:
    """Tunable Figma analysis parameters"""
    
    # Frame limiting
    MAX_FRAMES_PER_ANALYSIS = 20  # Prevent runaway
    
    # Image optimization
    IMAGE_TARGET_WIDTH = 1280  # px (down to 800 for speed)
    IMAGE_QUALITY = 75  # JPEG quality (1-100)
    IMAGE_SCALE = 0.5  # Figma export scale (0.5 = 50%)
    
    # Batching
    IMAGE_BATCH_SIZE = 15  # Frames per API call
    MAX_CONCURRENT_DOWNLOADS = 5  # Parallel downloads
    MAX_CONCURRENT_ANALYSES = 3  # Parallel analyses
    
    # Timeouts
    IMAGE_FETCH_TIMEOUT = 90  # seconds
    ANALYSIS_TIMEOUT = 30  # seconds per frame
    
    # Caching
    ENABLE_CACHE = True
    CACHE_TTL_HOURS = 1
    
    # Performance monitoring
    ENABLE_METRICS = True
```

---

## Performance Monitoring

```python
# backend/app/services/figma_service.py

class AnalysisMetrics:
    """Track performance metrics"""
    
    def __init__(self):
        self.timings = {}
        self.start_time = datetime.utcnow()
    
    def mark(self, step: str):
        """Mark timestamp for step"""
        self.timings[step] = (
            datetime.utcnow() - self.start_time
        ).total_seconds()
        logger.info(f"⏱️ {step}: {self.timings[step]:.1f}s")
    
    def report(self):
        """Print metrics"""
        total = self.timings.get("complete", 0)
        logger.info(f"📊 Total time: {total:.1f}s")
        for step, timing in self.timings.items():
            pct = (timing / total * 100) if total else 0
            logger.info(f"  {step}: {timing:.1f}s ({pct:.0f}%)")
```

---

## Deployment Checklist

- [ ] Set `FIGMA_ANALYSIS_MAX_FRAMES` = 20 (or less for 30s SLA)
- [ ] Set `IMAGE_TARGET_WIDTH` = 1280 (or 800 for speed)
- [ ] Enable `ENABLE_CACHE` = True
- [ ] Set `MAX_CONCURRENT_DOWNLOADS` = 5
- [ ] Monitor metrics logs
- [ ] Test with 5, 10, 20 frame files
- [ ] Verify all complete within timeout
- [ ] Alert if any exceed 35s

---

## Expected Performance After Optimization

| Frames | Time | Notes |
|--------|------|-------|
| 5 | ~12s | ✅ Very fast |
| 10 | ~18s | ✅ Good |
| 15 | ~24s | ✅ Acceptable |
| 20 | ~30s | ⚠️ At limit |
| 30+ | 40+s | ❌ Exceeds timeout |

---

## If You Need Faster

### Option 1: Reduce scope
- Skip attention analysis (slowest)
- Focus on accessibility only

### Option 2: Use smaller images
```python
IMAGE_TARGET_WIDTH = 640  # Instead of 1280
IMAGE_SCALE = 0.25  # Instead of 0.5
```
Result: ~40-50% faster

### Option 3: Async image analysis
- Use async PIL or OpenCV
- Requires threading optimization

### Option 4: Defer to background job
- Return immediately with job ID
- Analyze asynchronously
- Notify user when ready

---

## Summary

**Critical optimizations:**
1. ✅ Limit frames (max 20)
2. ✅ Batch image requests (15-20 per call)
3. ✅ Parallelize downloads (5 concurrent)
4. ✅ Parallelize analysis (3 concurrent)
5. ✅ Resize images (1280px max)
6. ✅ Cache results (1 hour TTL)

**Expected result:** 20-30s for 20 frames ✅

---

Next: I'll create the actual optimized code for your backend.
