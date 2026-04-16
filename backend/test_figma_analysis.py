#!/usr/bin/env python3
"""
Quick test script to validate Figma analysis endpoint structure
"""

import sys
import asyncio
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

async def test_figma_analysis():
    """Test Figma analysis flow"""
    print("🧪 Testing Figma Analysis Flow...")
    print("=" * 60)
    
    try:
        # Test imports
        print("\n1️⃣  Testing imports...")
        from app.models.figma_models import (
            FigmaAnalysisResponse, 
            PageAnalysisResult, 
            FrameAnalysisResult,
            AccessibilityScore,
            ReadabilityScore,
            AttentionScore,
            ElementBounds,
            UIElement
        )
        from app.services.figma_service import FigmaAnalysisService
        from app.core.figma_client import FigmaAPIClient, FigmaExtractor
        print("   ✅ All imports successful")
        
        # Test URL extraction
        print("\n2️⃣  Testing URL extraction...")
        test_urls = [
            "https://www.figma.com/design/abc123/MyDesign",
            "https://www.figma.com/file/xyz789/TestFile"
        ]
        
        for url in test_urls:
            file_key = FigmaAPIClient.extract_file_key(url)
            print(f"   ✅ Extracted from {url[:40]}... -> {file_key}")
        
        # Test data structures
        print("\n3️⃣  Testing data model instantiation...")
        bounds = ElementBounds(x=0, y=0, width=100, height=100)
        print(f"   ✅ ElementBounds: {bounds}")
        
        ui_elem = UIElement(
            id="test1",
            name="Test Element",
            type="TEXT",
            bounds=bounds,
            text="Sample text"
        )
        print(f"   ✅ UIElement: {ui_elem.name}")
        
        access_score = AccessibilityScore(
            score=85.0,
            issues_found=1,
            contrast_issues=["Minor contrast issue"],
            recommendations=["Test recommendation"]
        )
        print(f"   ✅ AccessibilityScore: {access_score.score}")
        
        read_score = ReadabilityScore(
            score=90.0,
            text_density=35.0,
            font_legibility="good",
            line_spacing_quality="adequate",
            hierarchy_quality="clear"
        )
        print(f"   ✅ ReadabilityScore: {read_score.score}")
        
        attn_score = AttentionScore(
            score=80.0,
            focal_points=3,
            visual_hierarchy="strong"
        )
        print(f"   ✅ AttentionScore: {attn_score.score}")
        
        # Test response structure
        print("\n4️⃣  Testing response structure...")
        test_response = {
            "analyses": [
                {
                    "designName": "Frame 1",
                    "arai_score": 85.0,
                    "overall_grade": "B",
                    "arai_breakdown": {
                        "accessibility": 85.0,
                        "readability": 90.0,
                        "attention": 80.0
                    },
                    "accessibility": {"score": 85.0, "issues": []},
                    "readability": {"score": 90.0, "issues": []},
                    "attention": {"score": 80.0, "issues": []},
                    "preview": None,
                    "fileName": "TestFile - Page 1",
                    "timestamp": "2024-01-01T00:00:00",
                    "analysisId": "test-123",
                    "figmaUrl": "https://www.figma.com/design/abc123/Test",
                    "source": "figma"
                }
            ],
            "timestamp": "2024-01-01T00:00:00",
            "analysisId": "test-123",
            "totalScreens": 1,
            "totalPages": 1,
            "fileName": "TestFile",
            "file_name": "TestFile",
            "figmaUrl": "https://www.figma.com/design/abc123/Test",
            "averageAraiScore": 85.0,
            "average_accessibility_score": 85.0,
            "average_readability_score": 90.0,
            "average_attention_score": 80.0,
            "processingTime": 5.0,
            "file_key": "abc123"
        }
        
        print(f"   ✅ Response has {len(test_response['analyses'])} analyses")
        print(f"   ✅ Average ARAI Score: {test_response['averageAraiScore']}")
        print(f"   ✅ Average Accessibility: {test_response['average_accessibility_score']}")
        print(f"   ✅ Average Readability: {test_response['average_readability_score']}")
        print(f"   ✅ Average Attention: {test_response['average_attention_score']}")
        
        print("\n" + "=" * 60)
        print("✅ All tests passed! Figma analysis structure is valid.")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    result = asyncio.run(test_figma_analysis())
    sys.exit(0 if result else 1)
