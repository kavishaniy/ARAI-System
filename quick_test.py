#!/usr/bin/env python3
"""
Test Figma analysis endpoint quickly
"""
import requests
import json

figma_url = "https://www.figma.com/design/UHw9ANQMCKSIKmZgrxeOxl/Untitled?node-id=0-1&t=PQ8G1kjKcPlSEeP7-1"

print("=" * 70)
print("🧪 TESTING FIGMA ANALYSIS")
print("=" * 70)

# Test 1: URL Validation
print("\n1️⃣  Testing URL Validation...")
try:
    response = requests.post(
        "http://localhost:8000/api/v1/analysis/validate-url",
        json={"url": figma_url},
        timeout=10
    )
    print(f"Status: {response.status_code}")
    data = response.json()
    print(json.dumps(data, indent=2))
    
    if response.status_code == 200 and data.get("valid"):
        print("✅ URL is valid!")
    else:
        print(f"❌ Invalid response: {data}")
except Exception as e:
    print(f"❌ Error: {e}")

print("\n" + "=" * 70)
print("Note: Full analysis requires authentication and would take longer")
print("=" * 70)
