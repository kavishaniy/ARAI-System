#!/usr/bin/env python3
"""
Test Figma analysis endpoint
"""

import requests
import json
import asyncio

def test_figma_endpoint():
    """Test the Figma analysis endpoint"""
    print("🧪 Testing Figma Analysis Endpoint")
    print("=" * 70)
    
    # Endpoint
    url = "http://localhost:8000/api/v1/analysis/validate-url"
    figma_url = "https://www.figma.com/design/UHw9ANQMCKSIKmZgrxeOxl/Untitled?node-id=0-1&t=PQ8G1kjKcPlSEeP7-1"
    
    # Test 1: Validate URL
    print("\n1️⃣  Testing URL validation endpoint...")
    try:
        payload = {"url": figma_url}
        response = requests.post(url, json=payload, timeout=10)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        
        if response.status_code == 200:
            print("   ✅ URL validation passed")
        else:
            print(f"   ❌ URL validation failed: {response.json()}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    
    # Test 2: Check if analysis endpoint exists
    print("\n2️⃣  Checking Figma screens analysis endpoint...")
    analysis_url = "http://localhost:8000/api/v1/analysis/figma-screens"
    
    try:
        # This will fail due to auth, but we can see if the endpoint exists
        payload = {
            "figma_url": figma_url,
            "figma_token": None
        }
        response = requests.post(analysis_url, json=payload, timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code in [200, 401, 400]:
            print(f"   ✅ Endpoint exists")
            print(f"   Response: {response.json()}")
        else:
            print(f"   ❌ Unexpected status: {response.status_code}")
            
    except Exception as e:
        print(f"   ⚠️  Error: {e}")
        print("   This is expected if auth is required")
    
    print("\n" + "=" * 70)
    return True

if __name__ == "__main__":
    test_figma_endpoint()
