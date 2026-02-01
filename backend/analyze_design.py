#!/usr/bin/env python3
"""
Design Analysis Script using Trained Saliency Model
Analyzes a UI design image and generates comprehensive reports
"""

import sys
import os
from pathlib import Path
from app.ai_modules.comprehensive_attention_analyzer import ComprehensiveAttentionAnalyzer
import json

def analyze_design(image_path: str, output_dir: str = "analysis_output"):
    """
    Analyze a design image using the trained saliency model
    
    Args:
        image_path: Path to the design image
        output_dir: Directory to save analysis results
    """
    
    # Validate input
    if not os.path.exists(image_path):
        print(f"❌ Error: Image file not found: {image_path}")
        return None
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    print("="*60)
    print("🎨 ARAI Design Analysis Tool")
    print("="*60)
    print(f"\n📁 Input Image: {image_path}")
    print(f"📁 Output Directory: {output_dir}")
    
    # Initialize analyzer
    print("\n🔧 Initializing analyzer with trained model...")
    model_path = 'models/saliency_model.pth'
    
    if not os.path.exists(model_path):
        print(f"❌ Error: Model file not found: {model_path}")
        print("Please ensure the trained model is in the models/ directory")
        return None
    
    analyzer = ComprehensiveAttentionAnalyzer(model_path=model_path)
    print("✅ Analyzer initialized successfully")
    
    # Run analysis
    print("\n🚀 Running comprehensive design analysis...")
    print("   This includes:")
    print("   • Saliency heatmap generation")
    print("   • Critical UI element identification")
    print("   • Visual hierarchy assessment")
    print("   • Cognitive load estimation")
    
    try:
        result = analyzer.analyze_design(image_path)
        print("\n✅ Analysis completed successfully!")
        
        # Display results
        print("\n" + "="*60)
        print("📊 ANALYSIS RESULTS")
        print("="*60)
        
        # 1. Cognitive Load
        cognitive_load = result.get('cognitive_load', {})
        print("\n🧠 COGNITIVE LOAD ANALYSIS")
        print("-" * 60)
        if cognitive_load:
            overall_score = cognitive_load.get('overall_score', 'N/A')
            complexity = cognitive_load.get('complexity', 'N/A')
            recommendation = cognitive_load.get('recommendation', 'N/A')
            
            print(f"Overall Score: {overall_score}")
            print(f"Complexity Level: {complexity}")
            print(f"Recommendation: {recommendation}")
            
            # Detailed metrics
            metrics = cognitive_load.get('metrics', {})
            if metrics:
                print("\nDetailed Metrics:")
                print(f"  • Element Density: {metrics.get('element_density', 'N/A')}")
                print(f"  • Color Complexity: {metrics.get('color_complexity', 'N/A')}")
                print(f"  • Text Density: {metrics.get('text_density', 'N/A')}")
                print(f"  • Layout Complexity: {metrics.get('layout_complexity', 'N/A')}")
        else:
            print("No cognitive load data available")
        
        # 2. Critical UI Elements
        critical_elements = result.get('critical_ui_elements', [])
        print(f"\n🎯 CRITICAL UI ELEMENTS ({len(critical_elements)} found)")
        print("-" * 60)
        if critical_elements:
            for i, elem in enumerate(critical_elements[:5], 1):  # Show top 5
                priority = elem.get('priority', 'N/A')
                saliency = elem.get('saliency_score', 0)
                location = elem.get('location', {})
                size = elem.get('size', 'N/A')
                
                print(f"\n{i}. Element:")
                print(f"   Priority: {priority}")
                print(f"   Saliency Score: {saliency:.3f}")
                print(f"   Location: x={location.get('x', 'N/A')}, y={location.get('y', 'N/A')}")
                print(f"   Size: {size}")
                
                # Show attention metrics
                attention = elem.get('attention_metrics', {})
                if attention:
                    print(f"   Expected Attention: {attention.get('expected_attention_percentage', 'N/A')}")
        else:
            print("No critical elements identified")
        
        # 3. Visual Hierarchy
        hierarchy = result.get('visual_hierarchy', {})
        print(f"\n📈 VISUAL HIERARCHY ASSESSMENT")
        print("-" * 60)
        if hierarchy:
            overall_score = hierarchy.get('overall_score', 'N/A')
            flow_score = hierarchy.get('flow_score', 'N/A')
            
            print(f"Overall Score: {overall_score}")
            print(f"Flow Score: {flow_score}")
            
            # Show issues
            issues = hierarchy.get('issues', [])
            if issues:
                print(f"\n⚠️  Issues Found ({len(issues)}):")
                for i, issue in enumerate(issues[:3], 1):  # Show top 3
                    severity = issue.get('severity', 'N/A')
                    description = issue.get('description', 'N/A')
                    print(f"   {i}. [{severity}] {description}")
            else:
                print("\n✅ No hierarchy issues found")
            
            # Show recommendations
            recommendations = hierarchy.get('recommendations', [])
            if recommendations:
                print(f"\n💡 Recommendations:")
                for i, rec in enumerate(recommendations[:3], 1):
                    print(f"   {i}. {rec}")
        else:
            print("No hierarchy data available")
        
        # 4. Saliency Heatmap
        heatmap_path = result.get('saliency_heatmap_path', '')
        print(f"\n🔥 SALIENCY HEATMAP")
        print("-" * 60)
        if heatmap_path and os.path.exists(heatmap_path):
            print(f"✅ Generated: {heatmap_path}")
            print("   Open this file to see visual attention hotspots")
        else:
            print("❌ Heatmap not generated")
        
        # Save detailed JSON report
        report_path = os.path.join(output_dir, "analysis_report.json")
        with open(report_path, 'w') as f:
            json.dump(result, f, indent=2)
        
        print(f"\n💾 SAVED FILES")
        print("-" * 60)
        print(f"✅ JSON Report: {report_path}")
        if heatmap_path:
            print(f"✅ Heatmap: {heatmap_path}")
        
        print("\n" + "="*60)
        print("✨ Analysis Complete!")
        print("="*60)
        
        return result
        
    except Exception as e:
        print(f"\n❌ Analysis failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


def main():
    """Main entry point"""
    
    # Check command line arguments
    if len(sys.argv) < 2:
        print("Usage: python analyze_design.py <image_path> [output_dir]")
        print("\nExample:")
        print("  python analyze_design.py my_design.png")
        print("  python analyze_design.py screenshots/homepage.png output/")
        print("\nSupported formats: .jpg, .jpeg, .png")
        sys.exit(1)
    
    image_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else "analysis_output"
    
    # Run analysis
    analyze_design(image_path, output_dir)


if __name__ == '__main__':
    main()
