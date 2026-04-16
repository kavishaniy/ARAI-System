#!/usr/bin/env python3
"""
Figma Integration Test Script
Tests all aspects of the Figma integration pipeline
"""

import requests
import json
import sys
import os
from pathlib import Path

# Colors for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_success(msg):
    print(f"{GREEN}✅ {msg}{RESET}")

def print_error(msg):
    print(f"{RED}❌ {msg}{RESET}")

def print_warning(msg):
    print(f"{YELLOW}⚠️  {msg}{RESET}")

def print_info(msg):
    print(f"{BLUE}ℹ️  {msg}{RESET}")

def test_figma_token(token):
    """Test if Figma API token is valid"""
    print_info("Testing Figma API token...")
    
    if not token:
        print_error("FIGMA_API_TOKEN not set in environment")
        return False
    
    try:
        response = requests.get(
            "https://api.figma.com/v1/me",
            headers={"X-Figma-Token": token},
            timeout=10
        )
        
        if response.status_code == 200:
            user_data = response.json()
            print_success(f"Token valid! User: {user_data.get('handle', 'Unknown')}")
            return True
        elif response.status_code == 403:
            print_error("Token invalid or expired (403 Unauthorized)")
            return False
        else:
            print_error(f"Unexpected response: {response.status_code}")
            return False
    
    except requests.Timeout:
        print_error("Request timeout - check your internet connection")
        return False
    except Exception as e:
        print_error(f"Error testing token: {e}")
        return False

def test_file_key_extraction():
    """Test Figma URL file key extraction"""
    print_info("Testing file key extraction...")
    
    try:
        from app.core.figma_client import FigmaAPIClient
        
        test_urls = [
            ("https://www.figma.com/file/ABC123/MyProject", "ABC123"),
            ("https://www.figma.com/design/XYZ789/Design-System", "XYZ789"),
            ("https://www.figma.com/file/ABC123/Project?node-id=0%3A1", "ABC123"),
        ]
        
        all_passed = True
        for url, expected_key in test_urls:
            try:
                extracted = FigmaAPIClient.extract_file_key(url)
                if extracted == expected_key:
                    print_success(f"Extracted '{expected_key}' from URL")
                else:
                    print_error(f"Expected '{expected_key}' but got '{extracted}'")
                    all_passed = False
            except Exception as e:
                print_error(f"Failed to extract from {url}: {e}")
                all_passed = False
        
        return all_passed
    
    except ImportError:
        print_warning("Could not import FigmaAPIClient - run this from backend directory")
        return False

def test_file_access(token, file_key):
    """Test if we can access a specific Figma file"""
    print_info(f"Testing access to Figma file: {file_key}")
    
    try:
        response = requests.get(
            f"https://api.figma.com/v1/files/{file_key}",
            headers={"X-Figma-Token": token},
            timeout=30
        )
        
        if response.status_code == 200:
            file_data = response.json()
            name = file_data.get('name', 'Unknown')
            pages = len(file_data.get('document', {}).get('children', []))
            print_success(f"File accessible: '{name}' ({pages} pages)")
            return True
        
        elif response.status_code == 403:
            print_error("Access denied (403) - file is private or token lacks permission")
            return False
        
        elif response.status_code == 404:
            print_error("File not found (404) - check the file key")
            return False
        
        else:
            print_error(f"Unexpected response: {response.status_code}")
            return False
    
    except requests.Timeout:
        print_error("Request timeout - file might be too large")
        return False
    except Exception as e:
        print_error(f"Error accessing file: {e}")
        return False

def test_image_generation(token, file_key):
    """Test if we can get frame images"""
    print_info(f"Testing image generation for frames...")
    
    try:
        # First get frames from file
        file_response = requests.get(
            f"https://api.figma.com/v1/files/{file_key}",
            headers={"X-Figma-Token": token},
            timeout=30
        )
        
        if file_response.status_code != 200:
            print_error("Could not fetch file to get frame IDs")
            return False
        
        # Extract frame IDs
        file_data = file_response.json()
        frames = []
        
        def extract_frames(node, acc=[]):
            if node.get('type') in ('FRAME', 'BOARD'):
                acc.append(node.get('id'))
            for child in node.get('children', []):
                extract_frames(child, acc)
            return acc
        
        for page in file_data.get('document', {}).get('children', []):
            frames = extract_frames(page, frames)
        
        if not frames:
            print_warning("No frames found in file")
            return False
        
        # Test with first frame
        frame_id = frames[0]
        print_info(f"Testing image generation for frame: {frame_id}")
        
        response = requests.get(
            f"https://api.figma.com/v1/images/{file_key}",
            params={"ids": frame_id, "scale": 0.5, "format": "png"},
            headers={"X-Figma-Token": token},
            timeout=90
        )
        
        if response.status_code == 200:
            data = response.json()
            images = data.get('images', {})
            if images.get(frame_id):
                print_success(f"Got image URL for frame")
                return True
            else:
                print_warning(f"Frame {frame_id} failed to render")
                return False
        else:
            print_error(f"Error getting images: {response.status_code}")
            return False
    
    except Exception as e:
        print_error(f"Error testing image generation: {e}")
        return False

def test_backend_connection(backend_url="http://localhost:8000"):
    """Test if backend is running"""
    print_info(f"Testing backend connection to {backend_url}...")
    
    try:
        response = requests.get(
            f"{backend_url}/api/v1/health",
            timeout=5
        )
        
        if response.status_code == 200:
            print_success("Backend is running")
            return True
        else:
            print_warning(f"Backend returned {response.status_code}")
            return True  # Backend is up, even if health check failed
    
    except requests.ConnectionError:
        print_error(f"Could not connect to backend at {backend_url}")
        print_info("Make sure backend is running: python -m uvicorn app.main:app --reload")
        return False
    except Exception as e:
        print_error(f"Error connecting to backend: {e}")
        return False

def test_figma_connection_endpoint(backend_url="http://localhost:8000", token=None):
    """Test the backend /figma/test-connection endpoint"""
    print_info("Testing backend Figma connection endpoint...")
    
    try:
        headers = {}
        if token:
            headers["X-Figma-Token"] = token
        
        response = requests.get(
            f"{backend_url}/api/v1/figma/test-connection",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            print_success("Figma connection test passed")
            return True
        else:
            print_error(f"Connection test failed: {response.status_code}")
            print(response.text)
            return False
    
    except Exception as e:
        print_error(f"Error testing connection: {e}")
        return False

def main():
    """Run all tests"""
    print(f"\n{BLUE}🧪 Figma Integration Test Suite{RESET}\n")
    
    # Get token from environment
    token = os.getenv("FIGMA_API_TOKEN")
    if not token:
        print_warning("FIGMA_API_TOKEN not set in environment")
        print_info("Set it with: export FIGMA_API_TOKEN=ffile_...")
    
    results = []
    
    # Test 1: Token validation
    print_info("=" * 60)
    print("Test 1: Figma API Token Validation")
    print_info("=" * 60)
    results.append(("Token validation", test_figma_token(token)))
    
    # Test 2: File key extraction
    print_info("\n" + "=" * 60)
    print("Test 2: File Key Extraction")
    print_info("=" * 60)
    results.append(("File key extraction", test_file_key_extraction()))
    
    # Test 3: Backend connection
    print_info("\n" + "=" * 60)
    print("Test 3: Backend Connection")
    print_info("=" * 60)
    backend_ok = test_backend_connection()
    results.append(("Backend connection", backend_ok))
    
    # Test 4: Backend Figma endpoint
    if backend_ok and token:
        print_info("\n" + "=" * 60)
        print("Test 4: Backend Figma Connection Endpoint")
        print_info("=" * 60)
        results.append(("Backend Figma endpoint", test_figma_connection_endpoint(token=token)))
    
    # Test 5: File access (if test file key provided)
    if token:
        test_file_key = input("\n📄 Enter a Figma file key to test (or press Enter to skip): ").strip()
        if test_file_key:
            print_info("\n" + "=" * 60)
            print("Test 5: File Access")
            print_info("=" * 60)
            file_access_ok = test_file_access(token, test_file_key)
            results.append(("File access", file_access_ok))
            
            # Test 6: Image generation
            if file_access_ok:
                print_info("\n" + "=" * 60)
                print("Test 6: Image Generation")
                print_info("=" * 60)
                results.append(("Image generation", test_image_generation(token, test_file_key)))
    
    # Print summary
    print_info("\n" + "=" * 60)
    print("📊 Test Summary")
    print_info("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = f"{GREEN}PASS{RESET}" if result else f"{RED}FAIL{RESET}"
        print(f"{test_name:.<40} {status}")
    
    print_info(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print_success("\n🎉 All tests passed! Your Figma integration is ready to use.")
        return 0
    else:
        print_error("\n⚠️  Some tests failed. Check the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
