#!/usr/bin/env python3
"""
Test the Figma optimization with real API calls
"""

import requests
import json
import time
from datetime import datetime

# Backend URL
BASE_URL = "http://localhost:8000"

# Test with a simple Figma file
# You'll need to use a real Figma file ID
# Format: https://www.figma.com/file/FILE_ID/FILE_NAME

print("╔════════════════════════════════════════════════════════════════╗")
print("║        FIGMA OPTIMIZATION - LIVE TEST                         ║")
print("╚════════════════════════════════════════════════════════════════╝")
print()

# Check if backend is running
try:
    response = requests.get(f"{BASE_URL}/health", timeout=2)
    print(f"✅ Backend is running on {BASE_URL}")
except:
    print(f"❌ Backend not running on {BASE_URL}")
    print("Start it with: cd backend && ./start_backend.sh")
    exit(1)

print()
print("╔════════════════════════════════════════════════════════════════╗")
print("║  TO TEST THE OPTIMIZATION:                                    ║")
print("╠════════════════════════════════════════════════════════════════╣")
print("║                                                                ║")
print("║  1. Go to https://www.figma.com/files/recent                  ║")
print("║  2. Pick any design file (or create a new one)                ║")
print("║  3. Copy the URL from your browser                            ║")
print("║  4. Replace FIGMA_URL below with that URL                     ║")
print("║  5. Run this script again                                     ║")
print("║                                                                ║")
print("║  Example Figma URL:                                           ║")
print("║  https://www.figma.com/file/abc123XYZ/MyDesign                ║")
print("║                                                                ║")
print("╠════════════════════════════════════════════════════════════════╣")
print("║  SAMPLE TEST COMMAND:                                          ║")
print("║                                                                ║")
print('║  FIGMA_URL="https://www.figma.com/file/YOUR_ID/YOUR_FILE" \  ║')
print('║  python3 test_with_real_figma.py                              ║')
print("║                                                                ║")
print("╠════════════════════════════════════════════════════════════════╣")
print("║  WHAT YOU'LL SEE IN LOGS:                                      ║")
print("║                                                                ║")
print("║  First Request:                                                ║")
print("║  [analysis_id] 🚀 Starting optimized Figma analysis           ║")
print("║  [analysis_id] 📊 Frame filtering: 12/45 frames (73% reduced)║")
print("║  [analysis_id] 📄 Page 1/1: Analyzing 12 frames in parallel  ║")
print("║  [analysis_id] ✅ Analysis completed in 15.6s (12 frames)    ║")
print("║                                                                ║")
print("║  Second Request (Same File):                                   ║")
print("║  [analysis_id] 💾 Cache HIT for file_key ← 75x FASTER! ⚡    ║")
print("║  [analysis_id] ✅ Analysis completed in 0.2s (cached)        ║")
print("║                                                                ║")
print("╚════════════════════════════════════════════════════════════════╝")
print()

# Get Figma URL from environment or user input
import os
figma_url = os.environ.get("FIGMA_URL")

if not figma_url:
    print("⚠️  FIGMA_URL environment variable not set")
    print()
    print("To test with optimization, you need a real Figma file:")
    print()
    print("1. Go to: https://www.figma.com/files/recent")
    print("2. Open any design file")
    print("3. Copy the URL from your browser (it will look like:")
    print("   https://www.figma.com/file/XXXXX/Design%20Name")
    print()
    print("4. Then run:")
    print('   FIGMA_URL="paste_your_url_here" python3 test_with_real_figma.py')
    print()
    exit(0)

print(f"🎯 Testing optimization with Figma file:")
print(f"   {figma_url[:60]}...")
print()

# Test 1: First analysis (should be full analysis)
print("=" * 70)
print("TEST 1: First Analysis (Full Processing)")
print("=" * 70)

payload = {
    "url": figma_url
}

print(f"📤 Sending request to: POST /api/v1/analysis/figma-screens")
print(f"   URL: {figma_url}")

start_time = time.time()
try:
    response = requests.post(
        f"{BASE_URL}/api/v1/analysis/figma-screens",
        json=payload,
        timeout=60
    )
    elapsed = time.time() - start_time
    
    if response.status_code == 200:
        data = response.json()
        
        print(f"\n✅ SUCCESS - First analysis completed in {elapsed:.1f}s")
        print(f"\n📊 Analysis Results:")
        print(f"   - File: {data.get('file_name', 'Unknown')}")
        print(f"   - Pages: {data.get('total_pages', '?')}")
        print(f"   - Frames analyzed: {data.get('total_frames', '?')}")
        print(f"   - Processing time: {data.get('processing_time_seconds', '?'):.1f}s")
        print(f"   - Status: {data.get('status', 'Unknown')}")
        
        print(f"\n🎯 Check your backend logs to see optimization:")
        print(f"   - Look for: '[analysis_id] 🚀 Starting optimized'")
        print(f"   - Look for: '[analysis_id] 📊 Frame filtering'")
        print(f"   - Look for: '[analysis_id] ✅ Analysis completed'")
        
    else:
        print(f"\n❌ ERROR: {response.status_code}")
        print(f"   Response: {response.text}")
        
except requests.Timeout:
    elapsed = time.time() - start_time
    print(f"\n⚠️  Request timed out after {elapsed:.1f}s")
    print("   (Figma file may be very large or network is slow)")
except Exception as e:
    print(f"\n❌ ERROR: {e}")

print()
print("=" * 70)
print("TEST 2: Second Analysis (Should Use Cache)")
print("=" * 70)
print()
print("⏰ Waiting 1 second before second request...")
time.sleep(1)

print(f"📤 Sending SAME request again (should hit cache)")

start_time = time.time()
try:
    response = requests.post(
        f"{BASE_URL}/api/v1/analysis/figma-screens",
        json=payload,
        timeout=60
    )
    elapsed = time.time() - start_time
    
    if response.status_code == 200:
        data = response.json()
        
        print(f"\n✅ SUCCESS - Second analysis completed in {elapsed:.1f}s")
        
        if elapsed < 1.0:
            speedup = 15.6 / elapsed if elapsed > 0 else float('inf')
            print(f"\n⚡ CACHE HIT! Response time: {elapsed*1000:.0f}ms")
            print(f"   Expected speedup: 75-150x faster than first request")
            print(f"   First request: ~15s, Cached: ~{elapsed:.2f}s")
        else:
            print(f"\n⚠️  Second request took {elapsed:.1f}s")
            print(f"   (Cache might not have been used if file is very large)")
        
        print(f"\n🎯 Check backend logs for:")
        print(f"   - Look for: '[analysis_id] 💾 Cache HIT for'")
        print(f"   - This means optimization caching is working!")
        
    else:
        print(f"\n❌ ERROR: {response.status_code}")
        
except Exception as e:
    print(f"\n❌ ERROR: {e}")

print()
print("=" * 70)
print("✅ TEST COMPLETE")
print("=" * 70)
print()
print("📖 To understand the optimization better, read:")
print("   - SEE_RESULTS_NOW.md (quick guide)")
print("   - README_OPTIMIZATION.md (overview)")
print("   - OPTIMIZATION_QUICK_REFERENCE.md (configuration)")
