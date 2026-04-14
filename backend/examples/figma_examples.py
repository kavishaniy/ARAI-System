"""
Quick Start: Running Figma Analysis
Complete example of using the Figma integration
"""

import asyncio
import os
from datetime import datetime

# Example 1: Direct Service Usage (Backend)
# ==========================================

async def example_direct_analysis():
    """
    Run analysis directly using the service.
    Useful for testing and batch processing.
    """
    from app.services.figma_service import FigmaAnalysisService
    
    # Initialize service
    service = FigmaAnalysisService(figma_token=os.getenv("FIGMA_API_TOKEN"))
    
    # Figma file URL
    figma_url = "https://www.figma.com/file/abc123def/MyDesign"
    
    try:
        print("📋 Starting Figma analysis...")
        
        # Run analysis
        result = await service.analyze_from_url(
            figma_url=figma_url,
            analysis_scope=["accessibility", "readability", "attention"]
        )
        
        # Display results
        print("\n✅ Analysis completed!")
        print(f"File: {result.file_name}")
        print(f"Pages: {result.total_pages}")
        print(f"Frames: {result.total_frames}")
        print(f"Processing time: {result.processing_time_seconds:.2f}s")
        
        print(f"\n📊 Scores:")
        print(f"  Accessibility: {result.average_accessibility_score:.1f}/100")
        print(f"  Readability: {result.average_readability_score:.1f}/100")
        print(f"  Visual Hierarchy: {result.average_attention_score:.1f}/100")
        
        # Print frame details
        print(f"\n🖼️  Frames analyzed:")
        for page in result.page_results:
            print(f"\n  Page: {page.page_name}")
            for frame in page.frame_results:
                print(f"    - {frame.frame_name}")
                if frame.accessibility:
                    print(f"      Accessibility: {frame.accessibility.score:.1f}")
                if frame.readability:
                    print(f"      Readability: {frame.readability.score:.1f}")
                if frame.attention:
                    print(f"      Hierarchy: {frame.attention.score:.1f}")
        
        return result
    
    except Exception as e:
        print(f"❌ Analysis failed: {e}")
        raise


# Example 2: API Usage (Frontend/External)
# =========================================

def example_api_usage():
    """
    Use the API endpoints.
    Run the FastAPI server first: uvicorn app.main:app --reload
    """
    import requests
    import json
    import time
    
    API_BASE = "http://localhost:8000"
    
    figma_url = "https://www.figma.com/file/abc123def/MyDesign"
    
    print("1️⃣ Validate URL")
    print("=" * 50)
    
    # Validate URL
    response = requests.post(
        f"{API_BASE}/api/v1/figma/validate-url",
        json={"url": figma_url}
    )
    print(response.json())
    
    if not response.json()["valid"]:
        print("❌ Invalid URL!")
        return
    
    print("\n2️⃣ Start Analysis")
    print("=" * 50)
    
    # Start analysis
    response = requests.post(
        f"{API_BASE}/api/v1/figma/analyze",
        json={
            "figma_url": figma_url,
            "analysis_scope": ["accessibility", "readability", "attention"]
        }
    )
    
    data = response.json()
    print(f"Status: {data['status']}")
    print(f"Analysis ID: {data['analysis_id']}")
    
    analysis_id = data['analysis_id']
    
    print("\n3️⃣ Poll for Results")
    print("=" * 50)
    
    # Poll for completion
    while True:
        response = requests.get(f"{API_BASE}/api/v1/figma/analyze/{analysis_id}")
        status_data = response.json()
        
        status = status_data.get('status')
        progress = status_data.get('progress', 0)
        step = status_data.get('current_step', 'Starting...')
        
        print(f"\nStatus: {status}")
        print(f"Progress: {progress}%")
        print(f"Current step: {step}")
        
        if status == 'completed':
            print("\n✅ Analysis completed!")
            
            # Display results
            results = status_data
            print(f"\nFile: {results['file_name']}")
            print(f"Pages: {results['total_pages']}")
            print(f"Frames: {results['total_frames']}")
            
            print(f"\n📊 Overall Scores:")
            print(f"  Accessibility: {results.get('average_accessibility_score', 'N/A')}")
            print(f"  Readability: {results.get('average_readability_score', 'N/A')}")
            print(f"  Hierarchy: {results.get('average_attention_score', 'N/A')}")
            
            # Save results to file
            with open(f"analysis_{analysis_id}.json", "w") as f:
                json.dump(results, f, indent=2)
            
            break
        
        elif status == 'failed':
            print(f"❌ Analysis failed: {status_data.get('error')}")
            break
        
        time.sleep(2)  # Poll every 2 seconds


# Example 3: Extracting Specific Information
# ===========================================

async def example_extract_details():
    """
    Extract and analyze specific design details.
    """
    from app.core.figma_client import FigmaExtractor
    from app.services.figma_service import FigmaAccessibilityAnalyzer
    
    extractor = FigmaExtractor(token=os.getenv("FIGMA_API_TOKEN"))
    
    figma_url = "https://www.figma.com/file/abc123def/MyDesign"
    
    print("📥 Extracting Figma data...")
    extracted = extractor.extract_from_url(figma_url)
    
    print(f"\nFile: {extracted['file_name']}")
    print(f"Pages: {len(extracted['pages'])}")
    
    # Analyze first page
    for page in extracted['pages']:
        print(f"\nPage: {page['page_name']}")
        
        for frame in page['frames']:
            print(f"  Frame: {frame['frame_name']}")
            print(f"  Size: {frame['bounds']['width']}x{frame['bounds']['height']}")
            print(f"  Elements: {len(frame['elements'])}")
            
            # List elements
            for elem in frame['elements'][:5]:  # First 5 elements
                print(f"    - {elem['type']}: {elem['name']}", end="")
                if elem.get('text'):
                    print(f" (text: '{elem['text'][:20]}...')", end="")
                print()
            
            if len(frame['elements']) > 5:
                print(f"    ... and {len(frame['elements']) - 5} more elements")


# Example 4: Batch Analysis
# ==========================

async def example_batch_analysis(figma_urls: list):
    """
    Analyze multiple Figma files.
    """
    from app.services.figma_service import FigmaAnalysisService
    
    service = FigmaAnalysisService(token=os.getenv("FIGMA_API_TOKEN"))
    
    results = {}
    
    for url in figma_urls:
        try:
            print(f"\n📋 Analyzing: {url}")
            result = await service.analyze_from_url(url)
            
            results[url] = {
                "file_name": result.file_name,
                "accessibility": result.average_accessibility_score,
                "readability": result.average_readability_score,
                "attention": result.average_attention_score,
                "processing_time": result.processing_time_seconds
            }
            
            print(f"✅ Completed: {result.file_name}")
        
        except Exception as e:
            print(f"❌ Failed: {e}")
            results[url] = {"error": str(e)}
    
    # Summary
    print("\n\n📊 Batch Analysis Summary")
    print("=" * 70)
    
    for url, data in results.items():
        if "error" in data:
            print(f"{url}: ERROR - {data['error']}")
        else:
            print(f"{data['file_name']}:")
            print(f"  Accessibility: {data['accessibility']:.1f}")
            print(f"  Readability: {data['readability']:.1f}")
            print(f"  Hierarchy: {data['attention']:.1f}")
            print(f"  Time: {data['processing_time']:.2f}s")
    
    return results


# Example 5: Custom Analysis with Detailed Insights
# =================================================

async def example_detailed_analysis():
    """
    Perform analysis and extract detailed insights.
    """
    from app.services.figma_service import FigmaAnalysisService
    
    service = FigmaAnalysisService(token=os.getenv("FIGMA_API_TOKEN"))
    figma_url = "https://www.figma.com/file/abc123def/MyDesign"
    
    print("🔍 Detailed Analysis")
    print("=" * 70)
    
    result = await service.analyze_from_url(figma_url)
    
    for page in result.page_results:
        print(f"\n📄 Page: {page.page_name}")
        print(f"   Total frames: {page.total_frames}")
        
        for frame in page.frame_results:
            print(f"\n   🖼️  Frame: {frame.frame_name}")
            print(f"      Dimensions: {frame.bounds.width}x{frame.bounds.height}")
            print(f"      Elements: {len(frame.elements)}")
            
            # Accessibility details
            if frame.accessibility:
                acc = frame.accessibility
                print(f"\n      🎯 Accessibility (Score: {acc.score:.0f}/100)")
                print(f"         WCAG Level: {acc.wcag_level}")
                print(f"         Issues Found: {acc.issues_found}")
                
                if acc.contrast_issues:
                    print(f"         Contrast Issues:")
                    for issue in acc.contrast_issues[:3]:
                        print(f"           - {issue}")
                
                print(f"         Recommendations:")
                for rec in acc.recommendations[:2]:
                    print(f"           ✓ {rec}")
            
            # Readability details
            if frame.readability:
                read = frame.readability
                print(f"\n      📖 Readability (Score: {read.score:.0f}/100)")
                print(f"         Text Density: {read.text_density:.1f}%")
                print(f"         Avg Font Size: {read.average_font_size:.0f}px")
                print(f"         Legibility: {read.font_legibility}")
                print(f"         Line Spacing: {read.line_spacing_quality}")
                print(f"         Hierarchy: {read.hierarchy_quality}")
            
            # Attention details
            if frame.attention:
                att = frame.attention
                print(f"\n      👁️  Visual Hierarchy (Score: {att.score:.0f}/100)")
                print(f"         Focal Points: {att.focal_points}")
                print(f"         Hierarchy Strength: {att.visual_hierarchy}")
                if att.primary_focus_area:
                    print(f"         Primary Focus: ({att.primary_focus_area.x:.0f}, {att.primary_focus_area.y:.0f})")


# Example 6: Error Handling
# ========================

async def example_error_handling():
    """
    Demonstrate error handling and recovery.
    """
    from app.services.figma_service import FigmaAnalysisService
    
    service = FigmaAnalysisService(token=os.getenv("FIGMA_API_TOKEN"))
    
    test_cases = [
        ("invalid_url", "This is not a Figma URL"),
        ("missing_file", "https://www.figma.com/file/nonexistent/Design"),
        ("valid_url", "https://www.figma.com/file/abc123def/MyDesign"),
    ]
    
    for name, url in test_cases:
        try:
            print(f"\nTesting: {name}")
            print(f"URL: {url}")
            
            result = await service.analyze_from_url(url)
            print(f"✅ Success: {result.file_name}")
        
        except ValueError as e:
            print(f"⚠️ Validation Error: {e}")
        
        except Exception as e:
            print(f"❌ Error: {type(e).__name__}: {e}")


# Main execution
# =============

async def main():
    """Run examples"""
    
    print("🎨 ARAI Figma Integration - Quick Start Examples")
    print("=" * 70)
    
    # Set your Figma token
    if not os.getenv("FIGMA_API_TOKEN"):
        print("⚠️  FIGMA_API_TOKEN not set")
        print("   Set it: export FIGMA_API_TOKEN='your_token'")
        return
    
    # Uncomment to run examples:
    
    # Example 1: Direct service analysis
    # await example_direct_analysis()
    
    # Example 2: API usage (requires running server)
    # example_api_usage()
    
    # Example 3: Extract details
    # await example_extract_details()
    
    # Example 4: Batch analysis
    # urls = [
    #     "https://www.figma.com/file/abc123/Design1",
    #     "https://www.figma.com/file/def456/Design2",
    # ]
    # await example_batch_analysis(urls)
    
    # Example 5: Detailed insights
    # await example_detailed_analysis()
    
    # Example 6: Error handling
    # await example_error_handling()
    
    print("\n📚 To run examples, uncomment the desired one in main()")


if __name__ == "__main__":
    asyncio.run(main())
