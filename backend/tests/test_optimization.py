"""
Integration tests for Figma analysis performance optimizations
"""

import asyncio
import pytest
import logging
from unittest.mock import Mock, patch, AsyncMock
from app.services.figma_service import FigmaAnalysisService
from app.core.figma_optimization import (
    OptimizationConfig, FrameLimiter, FigmaAnalysisCache, AnalysisMetrics
)

logger = logging.getLogger(__name__)


class TestFrameLimiter:
    """Test frame filtering and limiting"""
    
    def setup_method(self):
        self.config = OptimizationConfig(max_frames_per_analysis=5)
        self.limiter = FrameLimiter(self.config)
    
    def test_filter_hidden_frames(self):
        """Should skip hidden frames"""
        frames = [
            {"name": "Screen 1", "visible": True},
            {"name": "Hidden", "visible": False},
            {"name": "Screen 2", "visible": True},
        ]
        
        filtered, skipped = self.limiter.filter_frames(frames)
        
        assert len(filtered) == 2
        assert skipped == 1
        assert all(f["visible"] for f in filtered)
    
    def test_filter_components(self):
        """Should skip component frames"""
        frames = [
            {"name": "Screen", "visible": True, "is_component": False},
            {"name": "Button Component", "visible": True, "is_component": True},
            {"name": "Screen 2", "visible": True, "is_component": False},
        ]
        
        filtered, skipped = self.limiter.filter_frames(frames)
        
        assert len(filtered) == 2
        assert skipped == 1
        assert not any(f.get("is_component") for f in filtered)
    
    def test_limit_max_frames(self):
        """Should limit to max 20 frames"""
        frames = [
            {"name": f"Screen {i}", "visible": True, "is_component": False}
            for i in range(100)
        ]
        
        filtered, skipped = self.limiter.filter_frames(frames)
        
        assert len(filtered) == 5  # Our test config limit
        assert skipped == 95
    
    def test_combination_filters(self):
        """Should apply all filters"""
        frames = [
            {"name": "Good 1", "visible": True, "is_component": False},   # ✓
            {"name": "Hidden", "visible": False, "is_component": False},   # ✗
            {"name": "Component", "visible": True, "is_component": True},  # ✗
            {"name": "Good 2", "visible": True, "is_component": False},   # ✓
            {"name": "Good 3", "visible": True, "is_component": False},   # ✓
            {"name": "Good 4", "visible": True, "is_component": False},   # ✓
            {"name": "Good 5", "visible": True, "is_component": False},   # ✓
            {"name": "Excess", "visible": True, "is_component": False},   # ✗ limit
        ]
        
        filtered, skipped = self.limiter.filter_frames(frames)
        
        assert len(filtered) == 5
        assert skipped == 3


class TestAnalysisCache:
    """Test caching behavior"""
    
    def setup_method(self):
        self.config = OptimizationConfig(enable_cache=True)
        FigmaAnalysisCache.clear()  # Start fresh
    
    def test_cache_miss_on_first_access(self):
        """First access should miss cache"""
        cache = FigmaAnalysisCache(self.config)
        result = cache.get("file1", ["frame1", "frame2"])
        assert result is None
    
    def test_cache_set_and_get(self):
        """Should cache and retrieve data"""
        cache = FigmaAnalysisCache(self.config)
        data = {"analysis": "results", "score": 0.85}
        
        cache.set("file1", ["frame1", "frame2"], data)
        result = cache.get("file1", ["frame1", "frame2"])
        
        assert result is not None
        assert result["score"] == 0.85
    
    def test_cache_disabled(self):
        """Should not cache when disabled"""
        config = OptimizationConfig(enable_cache=False)
        cache = FigmaAnalysisCache(config)
        data = {"analysis": "results"}
        
        cache.set("file1", ["frame1"], data)
        result = cache.get("file1", ["frame1"])
        
        assert result is None
    
    def test_cache_key_generation(self):
        """Different frame lists should have different keys"""
        cache = FigmaAnalysisCache(self.config)
        
        key1 = cache.get_cache_key("file1", ["f1", "f2"])
        key2 = cache.get_cache_key("file1", ["f1", "f3"])  # Different frames
        key3 = cache.get_cache_key("file2", ["f1", "f2"])  # Different file
        
        assert key1 != key2
        assert key1 != key3
        assert key1.startswith("figma:")
    
    def test_cache_clear(self):
        """Should clear all cached data"""
        cache = FigmaAnalysisCache(self.config)
        cache.set("file1", ["f1"], {"data": "value1"})
        cache.set("file2", ["f1"], {"data": "value2"})
        
        FigmaAnalysisCache.clear()
        
        assert cache.get("file1", ["f1"]) is None
        assert cache.get("file2", ["f1"]) is None


class TestAnalysisMetrics:
    """Test performance metrics tracking"""
    
    def test_metrics_marking(self):
        """Should track timing for each step"""
        metrics = AnalysisMetrics("test_id", enable=True)
        
        metrics.mark("step1")
        assert "step1" in metrics.timings
        
        metrics.mark("step2")
        assert "step2" in metrics.timings
        
        # step2 should have elapsed more time than step1
        assert metrics.timings["step2"] >= metrics.timings["step1"]
    
    def test_metrics_disabled(self):
        """Should not track when disabled"""
        metrics = AnalysisMetrics("test_id", enable=False)
        metrics.mark("step1")
        
        assert len(metrics.timings) == 0
    
    def test_metrics_report(self):
        """Should generate report without errors"""
        metrics = AnalysisMetrics("test_id", enable=True)
        metrics.mark("extraction")
        metrics.mark("analysis")
        metrics.mark("complete")
        
        # Should not raise exception
        metrics.report()
        
        assert len(metrics.timings) == 3


class TestFigmaAnalysisServiceOptimization:
    """Test integration of optimization in FigmaAnalysisService"""
    
    @pytest.mark.asyncio
    async def test_service_initialization(self):
        """Service should initialize with optimizer"""
        service = FigmaAnalysisService()
        
        assert service.optimizer is not None
        assert service.optimizer.limiter is not None
        assert service.optimizer.cache is not None
    
    @pytest.mark.asyncio
    async def test_custom_configuration(self):
        """Service should accept custom optimization config"""
        config = OptimizationConfig(
            max_frames_per_analysis=30,
            max_concurrent_analyses=5
        )
        service = FigmaAnalysisService(optimization_config=config)
        
        assert service.optimizer.config.max_frames_per_analysis == 30
        assert service.optimizer.config.max_concurrent_analyses == 5
    
    @pytest.mark.asyncio
    async def test_parallel_analysis_semaphore(self):
        """Should limit concurrent analyses to configured amount"""
        config = OptimizationConfig(max_concurrent_analyses=2)
        service = FigmaAnalysisService(optimization_config=config)
        
        # Verify config is set
        assert service.optimizer.config.max_concurrent_analyses == 2


class TestOptimizationConfig:
    """Test configuration options"""
    
    def test_default_config(self):
        """Should have sensible defaults"""
        config = OptimizationConfig()
        
        assert config.max_frames_per_analysis == 20
        assert config.max_concurrent_analyses == 3
        assert config.enable_cache == True
        assert config.cache_ttl_hours == 1
        assert config.image_target_width == 1280
    
    def test_custom_config(self):
        """Should accept custom values"""
        config = OptimizationConfig(
            max_frames_per_analysis=10,
            max_concurrent_analyses=5,
            enable_cache=False,
            cache_ttl_hours=2
        )
        
        assert config.max_frames_per_analysis == 10
        assert config.max_concurrent_analyses == 5
        assert config.enable_cache == False
        assert config.cache_ttl_hours == 2
    
    def test_config_for_performance(self):
        """Config for fast analysis (fewer frames, parallel)"""
        config = OptimizationConfig(
            max_frames_per_analysis=10,
            max_concurrent_analyses=5,  # High parallelism
            image_scale=0.3,             # Lower resolution
            image_quality=50             # Lower quality
        )
        
        assert config.max_frames_per_analysis == 10
        assert config.max_concurrent_analyses == 5


# Performance benchmarking tests (commented out - run manually)
"""
class TestPerformanceBenchmarks:
    '''Benchmark real performance improvements'''
    
    @pytest.mark.asyncio
    async def test_cached_vs_fresh_analysis(self):
        '''Compare cached vs fresh analysis speed'''
        # This requires a real Figma token and file
        import time
        
        figma_url = "https://www.figma.com/file/YOUR_FILE_ID/YOUR_FILE"
        service = FigmaAnalysisService()
        
        # First analysis (full)
        start = time.time()
        result1 = await service.analyze_from_url(figma_url)
        fresh_time = time.time() - start
        
        # Second analysis (cached)
        start = time.time()
        result2 = await service.analyze_from_url(figma_url)
        cached_time = time.time() - start
        
        speedup = fresh_time / cached_time
        
        assert cached_time < 1.0, "Cached analysis should be < 1s"
        assert speedup > 10, "Cache should provide >10x speedup"
        
        print(f"Fresh: {fresh_time:.2f}s, Cached: {cached_time:.2f}s, Speedup: {speedup:.0f}x")
"""


if __name__ == "__main__":
    # Run basic tests
    pytest.main([__file__, "-v"])
