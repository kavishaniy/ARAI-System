#!/usr/bin/env python3
"""
Batch Design Analysis Tool
Analyze multiple designs and generate comparison reports
"""

import os
import sys
import json
from pathlib import Path
from app.ai_modules.comprehensive_attention_analyzer import ComprehensiveAttentionAnalyzer
from datetime import datetime

def batch_analyze(input_dir: str, output_dir: str = "batch_analysis"):
    """
    Analyze all design images in a directory
    
    Args:
        input_dir: Directory containing design images
        output_dir: Directory to save analysis results
    """
    
    # Validate input directory
    if not os.path.exists(input_dir):
        print(f"❌ Error: Input directory not found: {input_dir}")
        return
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    print("="*70)
    print("📦 ARAI Batch Analysis Tool")
    print("="*70)
    print(f"📁 Input Directory: {input_dir}")
    print(f"📁 Output Directory: {output_dir}")
    print()
    
    # Find all image files
    supported_formats = ('.png', '.jpg', '.jpeg')
    image_files = []
    
    for filename in os.listdir(input_dir):
        if filename.lower().endswith(supported_formats):
            image_files.append(filename)
    
    if not image_files:
        print(f"❌ No image files found in {input_dir}")
        print(f"   Supported formats: {', '.join(supported_formats)}")
        return
    
    print(f"✅ Found {len(image_files)} design(s) to analyze")
    print()
    
    # Initialize analyzer once
    print("🔧 Initializing analyzer...")
    model_path = 'models/saliency_model.pth'
    analyzer = ComprehensiveAttentionAnalyzer(model_path=model_path)
    print("✅ Ready to analyze")
    print()
    
    # Analyze each design
    results = []
    for i, filename in enumerate(image_files, 1):
        print(f"[{i}/{len(image_files)}] Analyzing {filename}...")
        
        image_path = os.path.join(input_dir, filename)
        
        try:
            result = analyzer.analyze_design(image_path)
            
            # Save individual report
            report_name = f"{Path(filename).stem}_analysis.json"
            report_path = os.path.join(output_dir, report_name)
            
            with open(report_path, 'w') as f:
                json.dump(result, f, indent=2)
            
            # Store summary
            summary = {
                'filename': filename,
                'score': result.get('score', 0),
                'critical_elements': len(result.get('critical_elements', [])),
                'issues': len(result.get('visual_hierarchy', {}).get('issues', [])),
                'high_attention_pct': result.get('attention_distribution', {}).get('high_attention_percentage', 0),
                'report_path': report_path
            }
            results.append(summary)
            
            print(f"  ✅ Score: {summary['score']:.1f}/100")
            print(f"  ✅ Report: {report_path}")
            
        except Exception as e:
            print(f"  ❌ Failed: {str(e)}")
            continue
    
    print()
    print("="*70)
    print("📊 BATCH ANALYSIS SUMMARY")
    print("="*70)
    print()
    
    if results:
        # Sort by score
        results_sorted = sorted(results, key=lambda x: x['score'], reverse=True)
        
        print(f"{'Rank':<6} {'Design':<30} {'Score':<10} {'Issues':<8} {'Elements'}")
        print("-" * 70)
        
        for i, r in enumerate(results_sorted, 1):
            filename = r['filename'][:28] + '...' if len(r['filename']) > 30 else r['filename']
            print(f"{i:<6} {filename:<30} {r['score']:>5.1f}/100  {r['issues']:<8} {r['critical_elements']}")
        
        # Statistics
        print()
        print("📈 Statistics:")
        avg_score = sum(r['score'] for r in results) / len(results)
        print(f"  Average Score: {avg_score:.1f}/100")
        print(f"  Best Design: {results_sorted[0]['filename']} ({results_sorted[0]['score']:.1f})")
        print(f"  Worst Design: {results_sorted[-1]['filename']} ({results_sorted[-1]['score']:.1f})")
        
        # Save comparison report
        comparison_path = os.path.join(output_dir, "comparison_report.json")
        comparison = {
            'timestamp': datetime.now().isoformat(),
            'total_designs': len(results),
            'average_score': avg_score,
            'designs': results_sorted
        }
        
        with open(comparison_path, 'w') as f:
            json.dump(comparison, f, indent=2)
        
        print()
        print(f"💾 Comparison report: {comparison_path}")
    
    print()
    print("="*70)
    print("✨ Batch analysis complete!")
    print("="*70)


def main():
    """Main entry point"""
    
    if len(sys.argv) < 2:
        print("Usage: python batch_analyze.py <input_directory> [output_directory]")
        print("\nExample:")
        print("  python batch_analyze.py designs/")
        print("  python batch_analyze.py designs/ analysis_results/")
        print("\nAnalyzes all PNG/JPG images in the input directory")
        sys.exit(1)
    
    input_dir = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else "batch_analysis"
    
    batch_analyze(input_dir, output_dir)


if __name__ == '__main__':
    main()
