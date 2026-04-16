"""
Figma Analysis Performance Optimization Module
Implements frame limiting, batching, parallelization, and caching.
"""

import asyncio
import aiohttp
import logging
import json
import hashlib
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from PIL import Image
from io import BytesIO

logger = logging.getLogger(__name__)


@dataclass
class OptimizationConfig:
    """Configuration for Figma analysis optimization"""
    
    # Frame limiting
    max_frames_per_analysis: int = 5
    
    # Image optimization
    image_target_width: int = 1280  # pixels
    image_quality: int = 75  # JPEG quality
    image_scale: float = 0.5  # Figma export scale
    
    # Batching
    image_batch_size: int = 15  # Frames per API call
    max_concurrent_downloads: int = 5
    max_concurrent_analyses: int = 3
    
    # Timeouts
    image_fetch_timeout: int = 90  # seconds
    analysis_timeout: int = 30  # seconds per frame
    
    # Caching
    enable_cache: bool = True
    cache_ttl_hours: int = 1
    
    # Monitoring
    enable_metrics: bool = True


class FrameLimiter:
    """Intelligently limit frames for performance"""
    
    def __init__(self, config: OptimizationConfig):
        self.config = config
    
    def should_analyze_frame(
        self,
        frame: Dict,
        index: int,
        total: int
    ) -> bool:
        """
        Decide if we should analyze this frame.
        
        Rules:
        1. Skip hidden frames
        2. Skip components (unless top-level)
        3. Limit to max configured frames
        4. Prioritize visible screens
        """
        # Skip hidden
        if not frame.get("visible", True):
            logger.debug(f"Skipping hidden frame: {frame.get('name')}")
            return False
        
        # Skip components
        if frame.get("is_component", False):
            logger.debug(f"Skipping component: {frame.get('name')}")
            return False
        
        # Limit total
        if index >= self.config.max_frames_per_analysis:
            logger.debug(f"Hit max frames limit at index {index}")
            return False
        
        return True
    
    def filter_frames(self, frames: List[Dict]) -> Tuple[List[Dict], int]:
        """
        Filter frames for analysis.
        
        Returns:
            (filtered_frames, skipped_count)
        """
        filtered = []
        skipped = 0
        
        for idx, frame in enumerate(frames):
            if self.should_analyze_frame(frame, idx, len(frames)):
                filtered.append(frame)
            else:
                skipped += 1
        
        logger.info(
            f"📊 Frame filtering: analyzing {len(filtered)}/{len(frames)} "
            f"frames (skipped {skipped})"
        )
        return filtered, skipped


class ImageOptimizer:
    """Download and optimize images efficiently"""
    
    def __init__(self, config: OptimizationConfig):
        self.config = config
    
    async def download_image_async(
        self,
        session: aiohttp.ClientSession,
        url: str
    ) -> Optional[bytes]:
        """
        Download image with timeout.
        
        Args:
            session: aiohttp session
            url: Image URL
        
        Returns:
            Image bytes or None if failed
        """
        try:
            async with session.get(
                url,
                timeout=aiohttp.ClientTimeout(
                    total=self.config.image_fetch_timeout
                )
            ) as response:
                if response.status == 200:
                    return await response.read()
                else:
                    logger.warning(
                        f"Failed to download image: {response.status}"
                    )
        except asyncio.TimeoutError:
            logger.warning(f"Timeout downloading image: {url}")
        except Exception as e:
            logger.warning(f"Error downloading image: {e}")
        
        return None
    
    def resize_image(self, image_bytes: bytes) -> bytes:
        """
        Resize image to target width.
        
        Benefits:
        - 50-70% faster processing
        - Reduced memory usage
        - Maintains aspect ratio
        
        Args:
            image_bytes: Original image data
        
        Returns:
            Optimized image bytes
        """
        try:
            img = Image.open(BytesIO(image_bytes))
            
            # Check if resize needed
            if img.width <= self.config.image_target_width:
                return image_bytes  # Already optimized
            
            # Calculate new size maintaining aspect ratio
            ratio = self.config.image_target_width / img.width
            new_height = int(img.height * ratio)
            
            logger.debug(
                f"Resizing image from {img.width}x{img.height} to "
                f"{self.config.image_target_width}x{new_height}"
            )
            
            # Resize with high-quality filter
            resized = img.resize(
                (self.config.image_target_width, new_height),
                Image.Resampling.LANCZOS
            )
            
            # Save to bytes
            output = BytesIO()
            resized.save(
                output,
                format='PNG',
                quality=self.config.image_quality,
                optimize=True
            )
            return output.getvalue()
        
        except Exception as e:
            logger.warning(f"Failed to resize image: {e}")
            return image_bytes  # Return original if resize fails
    
    async def download_and_process_batch(
        self,
        image_urls: Dict[str, str]
    ) -> Dict[str, bytes]:
        """
        Download and resize multiple images in parallel.
        
        Args:
            image_urls: {frame_id: url}
        
        Returns:
            {frame_id: image_bytes}
        """
        if not image_urls:
            return {}
        
        result = {}
        errors = []
        
        async with aiohttp.ClientSession() as session:
            # Create semaphore to limit concurrent downloads
            semaphore = asyncio.Semaphore(
                self.config.max_concurrent_downloads
            )
            
            async def download_one(frame_id: str, url: str):
                async with semaphore:
                    try:
                        bytes_data = await self.download_image_async(
                            session, url
                        )
                        
                        if bytes_data:
                            # Resize immediately
                            optimized = self.resize_image(bytes_data)
                            result[frame_id] = optimized
                            logger.debug(
                                f"✅ Downloaded & optimized {frame_id} "
                                f"({len(optimized)} bytes)"
                            )
                        else:
                            errors.append((frame_id, "Download failed"))
                    
                    except Exception as e:
                        logger.warning(
                            f"Error processing {frame_id}: {e}"
                        )
                        errors.append((frame_id, str(e)))
            
            # Download all in parallel
            logger.info(
                f"📸 Downloading {len(image_urls)} images "
                f"({self.config.max_concurrent_downloads} concurrent)"
            )
            
            tasks = [
                download_one(fid, url)
                for fid, url in image_urls.items()
            ]
            await asyncio.gather(*tasks, return_exceptions=False)
        
        if errors:
            logger.warning(f"⚠️ {len(errors)} images failed to download")
        
        logger.info(
            f"📸 Downloaded {len(result)}/{len(image_urls)} images"
        )
        return result


class FigmaAnalysisCache:
    """Cache Figma analysis results (in-memory for now)"""
    
    # In-memory cache (use Redis for production)
    _cache: Dict[str, Dict] = {}
    
    def __init__(self, config: OptimizationConfig):
        self.config = config
    
    @staticmethod
    def get_cache_key(file_key: str, frame_ids: List[str]) -> str:
        """Generate cache key from file_key and frame IDs"""
        frames_hash = hashlib.md5(
            json.dumps(sorted(frame_ids)).encode()
        ).hexdigest()
        return f"figma:{file_key}:{frames_hash}"
    
    def get(
        self,
        file_key: str,
        frame_ids: List[str]
    ) -> Optional[Dict]:
        """
        Get cached analysis result.
        
        Args:
            file_key: Figma file key
            frame_ids: List of frame IDs
        
        Returns:
            Cached data or None
        """
        if not self.config.enable_cache:
            return None
        
        key = self.get_cache_key(file_key, frame_ids)
        cached = self._cache.get(key)
        
        if cached:
            # Check expiry
            if datetime.utcnow() < cached['expires_at']:
                logger.info(f"💾 Cache HIT for {file_key}")
                return cached['data']
            else:
                # Expired, clean up
                del self._cache[key]
                logger.info(f"💾 Cache EXPIRED for {file_key}")
        
        return None
    
    def set(
        self,
        file_key: str,
        frame_ids: List[str],
        data: Dict
    ):
        """
        Cache analysis result.
        
        Args:
            file_key: Figma file key
            frame_ids: List of frame IDs
            data: Analysis data to cache
        """
        if not self.config.enable_cache:
            return
        
        key = self.get_cache_key(file_key, frame_ids)
        self._cache[key] = {
            'data': data,
            'expires_at': datetime.utcnow() + timedelta(
                hours=self.config.cache_ttl_hours
            ),
            'created_at': datetime.utcnow()
        }
        
        logger.info(
            f"💾 Cached analysis for {file_key} "
            f"({len(self._cache)} total in cache)"
        )
    
    @staticmethod
    def clear():
        """Clear entire cache"""
        FigmaAnalysisCache._cache.clear()
        logger.info("💾 Cache cleared")


class AnalysisMetrics:
    """Track and report performance metrics"""
    
    def __init__(self, analysis_id: str, enable: bool = True):
        self.analysis_id = analysis_id
        self.enable = enable
        self.timings = {}
        self.start_time = datetime.utcnow()
    
    def mark(self, step: str):
        """Mark timestamp for a step"""
        if not self.enable:
            return
        
        elapsed = (
            datetime.utcnow() - self.start_time
        ).total_seconds()
        
        self.timings[step] = elapsed
        logger.info(
            f"[{self.analysis_id}] ⏱️ {step}: {elapsed:.1f}s"
        )
    
    def report(self):
        """Print detailed metrics report"""
        if not self.enable or not self.timings:
            return
        
        total = list(self.timings.values())[-1]
        logger.info(f"[{self.analysis_id}] 📊 Performance Report:")
        logger.info(f"[{self.analysis_id}]   Total time: {total:.1f}s")
        
        for step, timing in self.timings.items():
            pct = (timing / total * 100) if total else 0
            logger.info(
                f"[{self.analysis_id}]   {step}: {timing:.1f}s ({pct:.0f}%)"
            )


class PerformanceOptimizer:
    """Orchestrate all optimizations"""
    
    def __init__(self, config: OptimizationConfig = None):
        self.config = config or OptimizationConfig()
        self.limiter = FrameLimiter(self.config)
        self.optimizer = ImageOptimizer(self.config)
        self.cache = FigmaAnalysisCache(self.config)
    
    def log_config(self):
        """Log current configuration"""
        logger.info("🎯 Performance Optimization Configuration:")
        logger.info(f"  Max frames: {self.config.max_frames_per_analysis}")
        logger.info(f"  Image width: {self.config.image_target_width}px")
        logger.info(f"  Image scale: {self.config.image_scale}x")
        logger.info(f"  Batch size: {self.config.image_batch_size}")
        logger.info(
            f"  Concurrent downloads: "
            f"{self.config.max_concurrent_downloads}"
        )
        logger.info(
            f"  Concurrent analyses: "
            f"{self.config.max_concurrent_analyses}"
        )
        logger.info(f"  Cache enabled: {self.config.enable_cache}")
        logger.info(f"  Cache TTL: {self.config.cache_ttl_hours}h")


# Singleton instance for use throughout the app
_optimizer_instance = None


def get_optimizer(config: OptimizationConfig = None) -> PerformanceOptimizer:
    """Get or create optimizer instance"""
    global _optimizer_instance
    if _optimizer_instance is None:
        _optimizer_instance = PerformanceOptimizer(config)
    return _optimizer_instance
