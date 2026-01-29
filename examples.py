"""
ARAI System - Usage Examples
Demonstrates how to use the analysis modules directly
"""

import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / "backend"))

from app.ai_modules.wcag_analyzer import WCAGAnalyzer
from app.ai_modules.readability_analyzer import ReadabilityAnalyzer
from app.ai_modules.attention_analyzer import AttentionAnalyzer


def example_1_basic_analysis():
    """
    Example 1: Basic WCAG Analysis
    """
    print("=" * 60)
    print("Example 1: Basic WCAG Analysis")
    print("=" * 60)
    
    # Initialize analyzer
    analyzer = WCAGAnalyzer()
    
    # Analyze a design
    image_path = "data/figma_designs/Dashboard _ dashboard v1.png"
    results = analyzer.analyze_design(image_path)
    
    # Print summary
    print(f"\nDesign: {image_path}")
    print(f"Score: {results['score']}/100")
    print(f"Conformance Level: {results['conformance_level']}")
    print(f"\nIssues Found: {len(results['issues'])}")
    print(f"  - Critical: {results['issue_count']['critical']}")
    print(f"  - High: {results['issue_count']['high']}")
    print(f"  - Medium: {results['issue_count']['medium']}")
    print(f"  - Low: {results['issue_count']['low']}")
    
    # Print recommendations
    print("\nTop 3 Recommendations:")
    for i, rec in enumerate(results['recommendations'][:3], 1):
        print(f"{i}. {rec}")


def example_2_detailed_issues():
    """
    Example 2: Detailed Issue Inspection
    """
    print("\n" + "=" * 60)
    print("Example 2: Detailed Issue Inspection")
    print("=" * 60)
    
    analyzer = WCAGAnalyzer()
    image_path = "data/figma_designs/Login Page.png"
    results = analyzer.analyze_design(image_path)
    
    # Get high severity issues
    high_issues = [i for i in results['issues'] if i['severity'] == 'high']
    
    print(f"\nHigh Severity Issues ({len(high_issues)}):")
    print("-" * 60)
    
    for issue in high_issues:
        print(f"\n[{issue['wcag_criterion']}] {issue['type']}")
        print(f"Level: {issue['wcag_level']}")
        print(f"Description: {issue['description']}")
        print(f"Fix: {issue['recommendation']}")


def example_3_conformance_check():
    """
    Example 3: Check Specific Conformance Level
    """
    print("\n" + "=" * 60)
    print("Example 3: Conformance Level Check")
    print("=" * 60)
    
    analyzer = WCAGAnalyzer()
    image_path = "data/figma_designs/Landing Page.png"
    results = analyzer.analyze_design(image_path)
    
    conformance = results['conformance_details']
    
    print(f"\nConformance Report:")
    print(f"  Level A:   {'✓ PASS' if conformance['passes_a'] else '✗ FAIL'}")
    print(f"  Level AA:  {'✓ PASS' if conformance['passes_aa'] else '✗ FAIL'}")
    print(f"  Level AAA: {'✓ PASS' if conformance['passes_aaa'] else '✗ FAIL'}")
    
    print(f"\nFailures:")
    print(f"  A failures:   {conformance['a_failures']}")
    print(f"  AA failures:  {conformance['aa_failures']}")
    print(f"  AAA failures: {conformance['aaa_failures']}")


def example_4_readability_analysis():
    """
    Example 4: Readability Analysis
    """
    print("\n" + "=" * 60)
    print("Example 4: Readability Analysis")
    print("=" * 60)
    
    analyzer = ReadabilityAnalyzer()
    image_path = "data/figma_designs/Blog Page.png"
    results = analyzer.analyze_design(image_path)
    
    print(f"\nReadability Score: {results['score']}/100")
    
    if 'metrics' in results:
        metrics = results['metrics']
        print(f"\nMetrics:")
        print(f"  Flesch Reading Ease: {metrics.get('flesch_reading_ease', 'N/A')}")
        print(f"  Grade Level: {metrics.get('flesch_kincaid_grade', 'N/A')}")
        print(f"  Word Count: {metrics.get('word_count', 'N/A')}")
        print(f"  Avg Line Length: {metrics.get('avg_line_length', 'N/A')}")
    
    print(f"\nRecommendations:")
    for rec in results['recommendations']:
        print(f"  • {rec}")


def example_5_combined_analysis():
    """
    Example 5: Complete ARAI Analysis
    """
    print("\n" + "=" * 60)
    print("Example 5: Complete ARAI Analysis")
    print("=" * 60)
    
    # Initialize all analyzers
    wcag = WCAGAnalyzer()
    readability = ReadabilityAnalyzer()
    attention = AttentionAnalyzer("backend/models/saliency_model.pth")
    
    image_path = "data/figma_designs/Homepage.png"
    
    # Run all analyses
    print(f"\nAnalyzing: {image_path}")
    
    print("  [1/3] Running accessibility analysis...")
    accessibility_results = wcag.analyze_design(image_path)
    
    print("  [2/3] Running readability analysis...")
    readability_results = readability.analyze_design(image_path)
    
    print("  [3/3] Running attention analysis...")
    attention_results = attention.analyze_design(image_path)
    
    # Calculate ARAI score
    arai_score = (
        accessibility_results['score'] * 0.4 +
        readability_results['score'] * 0.3 +
        attention_results['score'] * 0.3
    )
    
    # Determine grade
    if arai_score >= 90:
        grade = 'A'
    elif arai_score >= 80:
        grade = 'B'
    elif arai_score >= 70:
        grade = 'C'
    elif arai_score >= 60:
        grade = 'D'
    else:
        grade = 'F'
    
    # Print results
    print(f"\n{'=' * 60}")
    print(f"ARAI SCORE: {arai_score:.1f}/100 (Grade {grade})")
    print(f"{'=' * 60}")
    
    print(f"\nComponent Scores:")
    print(f"  Accessibility: {accessibility_results['score']}/100")
    print(f"  Readability:   {readability_results['score']}/100")
    print(f"  Attention:     {attention_results['score']}/100")
    
    print(f"\nConformance: {accessibility_results['conformance_level']}")
    
    total_issues = len(accessibility_results['issues'])
    print(f"\nTotal Issues: {total_issues}")


def example_6_batch_analysis():
    """
    Example 6: Batch Analysis of Multiple Designs
    """
    print("\n" + "=" * 60)
    print("Example 6: Batch Analysis")
    print("=" * 60)
    
    analyzer = WCAGAnalyzer()
    designs_dir = Path("data/figma_designs")
    
    # Find all PNG/JPG files
    image_files = list(designs_dir.glob("*.png")) + list(designs_dir.glob("*.jpg"))
    
    print(f"\nAnalyzing {len(image_files)} designs...")
    
    results_summary = []
    
    for image_path in image_files[:5]:  # Analyze first 5
        print(f"\n  Analyzing: {image_path.name}")
        try:
            results = analyzer.analyze_design(str(image_path))
            results_summary.append({
                'name': image_path.name,
                'score': results['score'],
                'conformance': results['conformance_level'],
                'issues': len(results['issues'])
            })
        except Exception as e:
            print(f"    Error: {e}")
    
    # Print summary table
    print(f"\n{'=' * 60}")
    print(f"{'Design':<30} {'Score':<10} {'Conformance':<15} {'Issues'}")
    print(f"{'=' * 60}")
    
    for result in sorted(results_summary, key=lambda x: x['score'], reverse=True):
        print(f"{result['name']:<30} {result['score']:<10} {result['conformance']:<15} {result['issues']}")


def example_7_color_contrast_check():
    """
    Example 7: Specific Color Contrast Check
    """
    print("\n" + "=" * 60)
    print("Example 7: Color Contrast Check")
    print("=" * 60)
    
    from app.ai_modules.wcag_analyzer import WCAGAnalyzer
    import numpy as np
    
    analyzer = WCAGAnalyzer()
    
    # Test color pairs
    test_colors = [
        ("White on Black", [255, 255, 255], [0, 0, 0]),
        ("Dark Gray on Light Gray", [100, 100, 100], [200, 200, 200]),
        ("Blue on White", [0, 0, 255], [255, 255, 255]),
        ("Red on Green", [255, 0, 0], [0, 255, 0]),
    ]
    
    print(f"\nColor Contrast Results:")
    print(f"{'Color Pair':<30} {'Ratio':<10} {'AA':<8} {'AAA'}")
    print("-" * 60)
    
    for name, fg, bg in test_colors:
        fg_array = np.array(fg, dtype=np.uint8)
        bg_array = np.array(bg, dtype=np.uint8)
        
        ratio = analyzer._contrast_ratio(fg_array, bg_array)
        aa_pass = "✓ PASS" if ratio >= 4.5 else "✗ FAIL"
        aaa_pass = "✓ PASS" if ratio >= 7.0 else "✗ FAIL"
        
        print(f"{name:<30} {ratio:<10.2f} {aa_pass:<8} {aaa_pass}")


def main():
    """
    Run all examples
    """
    print("\n" + "=" * 60)
    print("ARAI SYSTEM - USAGE EXAMPLES")
    print("=" * 60)
    
    try:
        # Run examples
        example_1_basic_analysis()
        example_2_detailed_issues()
        example_3_conformance_check()
        example_4_readability_analysis()
        example_5_combined_analysis()
        example_6_batch_analysis()
        example_7_color_contrast_check()
        
        print("\n" + "=" * 60)
        print("All examples completed successfully!")
        print("=" * 60)
        
    except FileNotFoundError as e:
        print(f"\nError: {e}")
        print("Make sure test images exist in data/figma_designs/")
    except Exception as e:
        print(f"\nUnexpected error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
