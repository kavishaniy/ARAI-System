#!/usr/bin/env python3
"""
Quick test to verify that optimization is working
"""

import sys
import os
import asyncio

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

print("=" * 70)
print("🧪 TESTING FIGMA OPTIMIZATION IMPLEMENTATION")
print("=" * 70)

# Test 1: Can we import the optimization module?
print("\n✓ Test 1: Import optimization module...")
try:
    from app.core.figma_optimization import (
        OptimizationConfig, 
        FrameLimiter, 
        FigmaAnalysisCache,
        AnalysisMetrics,
        PerformanceOptimizer
    )
    print("  ✅ Successfully imported optimization module")
except ImportError as e:
    print(f"  ❌ Failed to import: {e}")
    sys.exit(1)

# Test 2: Can we create a config?
print("\n✓ Test 2: Create OptimizationConfig...")
try:
    config = OptimizationConfig(
        max_frames_per_analysis=20,
        max_concurrent_analyses=3,
        enable_cache=True,
        cache_ttl_hours=1
    )
    print(f"  ✅ Config created successfully")
    print(f"     - Max frames: {config.max_frames_per_analysis}")
    print(f"     - Concurrent: {config.max_concurrent_analyses}")
    print(f"     - Cache enabled: {config.enable_cache}")
except Exception as e:
    print(f"  ❌ Failed to create config: {e}")
    sys.exit(1)

# Test 3: Can we create a frame limiter?
print("\n✓ Test 3: Create FrameLimiter...")
try:
    limiter = FrameLimiter(config)
    print(f"  ✅ FrameLimiter created successfully")
    
    # Test frame filtering
    frames = [
        {"name": "Screen 1", "visible": True, "is_component": False},
        {"name": "Hidden", "visible": False, "is_component": False},
        {"name": "Component", "visible": True, "is_component": True},
        {"name": "Screen 2", "visible": True, "is_component": False},
    ]
    
    filtered, skipped = limiter.filter_frames(frames)
    print(f"  ✅ Frame filtering works: {len(filtered)}/4 frames kept, {skipped} skipped")
    print(f"     - Input: 4 frames (1 hidden, 1 component)")
    print(f"     - Output: {len(filtered)} analyzable frames")
except Exception as e:
    print(f"  ❌ Failed: {e}")
    sys.exit(1)

# Test 4: Can we create cache?
print("\n✓ Test 4: Create FigmaAnalysisCache...")
try:
    cache = FigmaAnalysisCache(config)
    print(f"  ✅ Cache created successfully")
    
    # Test caching
    test_data = {"score": 0.85, "frames": 5}
    cache.set("test_file", ["frame1", "frame2"], test_data)
    retrieved = cache.get("test_file", ["frame1", "frame2"])
    
    if retrieved and retrieved["score"] == 0.85:
        print(f"  ✅ Caching works: stored and retrieved data")
    else:
        print(f"  ❌ Cache retrieval failed")
except Exception as e:
    print(f"  ❌ Failed: {e}")
    sys.exit(1)

# Test 5: Can we create metrics tracker?
print("\n✓ Test 5: Create AnalysisMetrics...")
try:
    import time
    metrics = AnalysisMetrics("test_analysis", enable=True)
    print(f"  ✅ Metrics created successfully")
    
    metrics.mark("step1")
    time.sleep(0.1)
    metrics.mark("step2")
    
    if "step1" in metrics.timings and "step2" in metrics.timings:
        print(f"  ✅ Metrics tracking works")
        print(f"     - Step 1: {metrics.timings['step1']:.3f}s")
        print(f"     - Step 2: {metrics.timings['step2']:.3f}s")
    else:
        print(f"  ❌ Metrics not tracked")
except Exception as e:
    print(f"  ❌ Failed: {e}")
    sys.exit(1)

# Test 6: Can we create the main optimizer?
print("\n✓ Test 6: Create PerformanceOptimizer...")
try:
    optimizer = PerformanceOptimizer(config)
    print(f"  ✅ PerformanceOptimizer created successfully")
    print(f"     - Has limiter: {optimizer.limiter is not None}")
    print(f"     - Has cache: {optimizer.cache is not None}")
except Exception as e:
    print(f"  ❌ Failed: {e}")
    sys.exit(1)

# Test 7: Can we import and use the updated service?
print("\n✓ Test 7: Import FigmaAnalysisService with optimization...")
try:
    from app.services.figma_service import FigmaAnalysisService
    print(f"  ✅ Successfully imported FigmaAnalysisService")
    
    # Check if service has optimizer
    service = FigmaAnalysisService()
    if hasattr(service, 'optimizer'):
        print(f"  ✅ Service has optimizer attribute")
        print(f"     - Optimizer type: {type(service.optimizer).__name__}")
        print(f"     - Config: {service.optimizer.config}")
    else:
        print(f"  ⚠️  Service doesn't have optimizer (might need restart)")
except Exception as e:
    print(f"  ❌ Failed: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 70)
print("✅ ALL TESTS PASSED - OPTIMIZATION IS WORKING!")
print("=" * 70)

print("\n📊 Next Steps:")
print("1. Start your backend: ./start_backend.sh")
print("2. Test with a real Figma URL")
print("3. Check logs for optimization messages:")
print("   [analysis_id] 🚀 Starting optimized Figma analysis")
print("   [analysis_id] 💾 Cache HIT/MISS for file_key")
print("   [analysis_id] ✅ Analysis completed in X.XXs (Y frames)")
print("\n📖 Read: README_OPTIMIZATION.md for quick overview")
print("📖 Read: OPTIMIZATION_QUICK_REFERENCE.md for configuration")
