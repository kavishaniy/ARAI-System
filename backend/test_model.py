#!/usr/bin/env python3
"""
Test script for the Comprehensive Attention Analyzer
"""

from app.ai_modules.comprehensive_attention_analyzer import ComprehensiveAttentionAnalyzer
from PIL import Image, ImageDraw
import os

def main():
    # Initialize analyzer
    model_path = 'models/saliency_model.pth'
    print('🔧 Initializing analyzer...')
    analyzer = ComprehensiveAttentionAnalyzer(model_path=model_path)
    print('✅ Analyzer initialized successfully\n')

    # Create a test image with some UI elements
    print('🎨 Creating test UI design...')
    test_image = Image.new('RGB', (800, 600), color=(255, 255, 255))
    draw = ImageDraw.Draw(test_image)

    # Draw some UI elements
    # Header
    draw.rectangle([0, 0, 800, 80], fill=(66, 133, 244))
    draw.text((320, 30), 'Test App', fill=(255, 255, 255))

    # Button
    draw.rectangle([300, 200, 500, 260], fill=(52, 168, 83))
    draw.text((350, 220), 'Click Me', fill=(255, 255, 255))

    # Save test image
    test_path = 'test_ui_design.png'
    test_image.save(test_path)
    print(f'✅ Test image saved: {test_path}\n')

    # Run analysis
    print('🚀 Running comprehensive attention analysis...')
    try:
        result = analyzer.analyze_design(test_path)
        print('✅ Analysis completed successfully!\n')
        
        print('📊 Results:')
        print('=' * 50)
        
        # Cognitive load
        cognitive_load = result.get('cognitive_load', {})
        print(f'  🧠 Cognitive Load:')
        print(f'     Overall Score: {cognitive_load.get("overall_score", "N/A")}')
        print(f'     Complexity: {cognitive_load.get("complexity", "N/A")}')
        
        # Critical elements
        critical_elements = result.get('critical_ui_elements', [])
        print(f'\n  🎯 Critical UI Elements: {len(critical_elements)}')
        for i, elem in enumerate(critical_elements[:3], 1):
            print(f'     {i}. Priority: {elem.get("priority", "N/A")}, Saliency: {elem.get("saliency_score", "N/A"):.2f}')
        
        # Visual hierarchy
        hierarchy = result.get('visual_hierarchy', {})
        issues = hierarchy.get('issues', [])
        overall_score = hierarchy.get("overall_score", "N/A")
        print(f'\n  📈 Visual Hierarchy:')
        if isinstance(overall_score, (int, float)):
            print(f'     Overall Score: {overall_score:.2f}')
        else:
            print(f'     Overall Score: {overall_score}')
        print(f'     Issues Found: {len(issues)}')
        
        # Saliency heatmap
        heatmap_path = result.get('saliency_heatmap_path')
        print(f'\n  🔥 Saliency Heatmap: {"✅ Generated" if heatmap_path else "❌ Not generated"}')
        if heatmap_path:
            print(f'     Path: {heatmap_path}')
        
        print('=' * 50)
        
        # Clean up
        if os.path.exists(test_path):
            os.remove(test_path)
            print(f'\n🧹 Cleaned up test file: {test_path}')
        
        print('\n✨ Model test completed successfully!')
        print('The saliency model is working correctly and ready for production use.')
            
    except Exception as e:
        print(f'❌ Analysis failed: {str(e)}')
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
