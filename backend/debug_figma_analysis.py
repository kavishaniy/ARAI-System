#!/usr/bin/env python3
"""
Debug script to test Figma analysis with actual URL
"""

import asyncio
import sys
from pathlib import Path
from dotenv import load_dotenv
import os

# Load .env file first
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)

sys.path.insert(0, str(Path(__file__).parent))

async def test_with_actual_url():
    """Test with the actual Figma URL provided"""
    print("🧪 Testing Figma Analysis with Actual URL")
    print("=" * 70)
    
    figma_url = "https://www.figma.com/design/UHw9ANQMCKSIKmZgrxeOxl/Untitled?node-id=0-1&t=PQ8G1kjKcPlSEeP7-1"
    
    try:
        print(f"\n📌 Test URL: {figma_url}")
        
        # Test 1: URL validation
        print("\n1️⃣  Testing URL validation...")
        if "figma.com/file/" not in figma_url and "figma.com/design/" not in figma_url:
            print("   ❌ URL format invalid")
            return False
        print("   ✅ URL format valid")
        
        # Test 2: File key extraction
        print("\n2️⃣  Testing file key extraction...")
        from app.core.figma_client import FigmaAPIClient
        
        try:
            file_key = FigmaAPIClient.extract_file_key(figma_url)
            print(f"   ✅ File key extracted: {file_key}")
        except Exception as e:
            print(f"   ❌ Failed to extract file key: {e}")
            return False
        
        # Test 3: Check environment
        print("\n3️⃣  Checking environment setup...")
        import os
        from app.core.config import settings
        
        if not os.getenv("FIGMA_API_TOKEN"):
            print("   ⚠️  WARNING: FIGMA_API_TOKEN not set in environment")
            print("   📝  Please set the environment variable:")
            print("       export FIGMA_API_TOKEN='your-token-here'")
            print("       Get token from: https://www.figma.com/developers/api#auth")
            return False
        else:
            token = os.getenv("FIGMA_API_TOKEN")
            print(f"   ✅ FIGMA_API_TOKEN is set (token: {token[:20]}...)")
        
        # Test 4: Try to initialize service
        print("\n4️⃣  Initializing Figma service...")
        from app.services.figma_service import FigmaAnalysisService
        
        try:
            service = FigmaAnalysisService(figma_token=os.getenv("FIGMA_API_TOKEN"))
            print("   ✅ Service initialized successfully")
        except Exception as e:
            print(f"   ❌ Failed to initialize service: {e}")
            return False
        
        # Test 5: Try to extract file data
        print("\n5️⃣  Attempting to extract file data from Figma API...")
        print("   ⏳ This may take a few moments...")
        
        try:
            loop = asyncio.get_event_loop()
            extracted_data = await loop.run_in_executor(
                None, service.extractor.extract_from_url, figma_url
            )
            
            print(f"   ✅ Successfully extracted file data")
            print(f"   📊 File name: {extracted_data.get('file_name')}")
            print(f"   📄 Number of pages: {len(extracted_data.get('pages', []))}")
            
            for page in extracted_data.get('pages', []):
                print(f"      - Page: {page['page_name']} ({len(page.get('frames', []))} frames)")
            
            if len(extracted_data.get('pages', [])) == 0:
                print("   ⚠️  No pages found in the Figma file")
                print("      Possible reasons:")
                print("      - File might be empty")
                print("      - File might not be accessible with current token")
                print("      - File sharing settings might restrict access")
                return False
            
        except Exception as e:
            print(f"   ❌ Failed to extract file data: {e}")
            print(f"   📝 Error details: {str(e)}")
            
            # Check if it's an authentication error
            if "401" in str(e) or "unauthorized" in str(e).lower():
                print("\n   🔐 This looks like an authentication issue!")
                print("      Steps to fix:")
                print("      1. Go to https://www.figma.com/developers/api#auth")
                print("      2. Generate a personal access token")
                print("      3. Set it: export FIGMA_API_TOKEN='your-token'")
                print("      4. Ensure the token has access to this file")
            
            return False
        
        # Test 6: Run full analysis
        print("\n6️⃣  Running full Figma analysis...")
        print("   ⏳ Analyzing pages and frames...")
        
        try:
            analysis_result = await service.analyze_from_url(
                figma_url,
                analysis_scope=["accessibility", "readability", "attention"]
            )
            
            print(f"   ✅ Analysis completed successfully!")
            print(f"   📊 Total frames analyzed: {analysis_result.total_frames}")
            print(f"   📄 Total pages: {analysis_result.total_pages}")
            print(f"   ⏱️  Processing time: {analysis_result.processing_time_seconds:.2f}s")
            
            # Show scores
            if analysis_result.average_accessibility_score:
                print(f"   ♿ Avg Accessibility Score: {analysis_result.average_accessibility_score:.1f}/100")
            if analysis_result.average_readability_score:
                print(f"   📖 Avg Readability Score: {analysis_result.average_readability_score:.1f}/100")
            if analysis_result.average_attention_score:
                print(f"   👁️  Avg Attention Score: {analysis_result.average_attention_score:.1f}/100")
            
            return True
            
        except Exception as e:
            print(f"   ❌ Analysis failed: {e}")
            print(f"   📝 Error details: {str(e)}")
            import traceback
            traceback.print_exc()
            return False
        
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print()
    result = asyncio.run(test_with_actual_url())
    print("\n" + "=" * 70)
    if result:
        print("✅ All checks passed! Figma analysis should work.")
    else:
        print("❌ Issues found. See above for details.")
    print("=" * 70 + "\n")
    sys.exit(0 if result else 1)
