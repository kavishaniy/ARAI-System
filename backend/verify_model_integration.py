#!/usr/bin/env python3
"""
Verify that the web app is configured to use the trained saliency model.
This script checks:
1. Model file exists
2. Model loads correctly
3. Analyzer is initialized in the API
4. Model produces valid predictions
"""

import sys
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

import torch
from PIL import Image
import numpy as np

def check_model_file():
    """Check if model file exists"""
    model_path = backend_dir / "models" / "saliency_model.pth"
    
    print("=" * 60)
    print("📦 STEP 1: Checking Model File")
    print("=" * 60)
    print(f"Model path: {model_path}")
    
    if model_path.exists():
        size_mb = model_path.stat().st_size / (1024 * 1024)
        print(f"✅ Model file exists ({size_mb:.2f} MB)")
        return model_path
    else:
        print(f"❌ Model file NOT found!")
        print(f"\n💡 You need to train the model first.")
        print(f"   See GOOGLE_COLAB_TRAINING_GUIDE.md for instructions.")
        return None

def check_model_loading(model_path):
    """Check if model loads correctly"""
    print("\n" + "=" * 60)
    print("🔄 STEP 2: Testing Model Loading")
    print("=" * 60)
    
    try:
        from app.ai_modules.comprehensive_attention_analyzer import ComprehensiveAttentionAnalyzer
        
        analyzer = ComprehensiveAttentionAnalyzer(str(model_path))
        print(f"✅ ComprehensiveAttentionAnalyzer initialized")
        print(f"   Device: {analyzer.device}")
        print(f"   Model loaded: {analyzer.model is not None}")
        
        # Check model parameters
        params = list(analyzer.model.parameters())
        total_params = sum(p.numel() for p in params)
        print(f"   Total parameters: {total_params:,}")
        
        # Check first few weights to verify it's not random initialization
        first_param = params[0].flatten()[:5]
        print(f"   Sample weights: {[f'{w:.4f}' for w in first_param.tolist()]}")
        
        return analyzer
        
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        import traceback
        traceback.print_exc()
        return None

def check_api_integration():
    """Check if API uses the model"""
    print("\n" + "=" * 60)
    print("🌐 STEP 3: Checking API Integration")
    print("=" * 60)
    
    try:
        # Import the analysis router
        from app.api import analysis
        
        # Check if attention_analyzer is initialized
        if hasattr(analysis, 'attention_analyzer'):
            print("✅ attention_analyzer found in API module")
            
            analyzer = analysis.attention_analyzer
            if analyzer.model is not None:
                print("✅ API is using the trained model")
                return True
            else:
                print("⚠️  API analyzer initialized but model not loaded")
                return False
        else:
            print("❌ attention_analyzer not found in API module")
            return False
            
    except Exception as e:
        print(f"❌ Error checking API: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_prediction(analyzer):
    """Test model with sample image"""
    print("\n" + "=" * 60)
    print("🧪 STEP 4: Testing Model Prediction")
    print("=" * 60)
    
    try:
        # Create a simple test image
        test_image_path = backend_dir / "test_ui_verification.png"
        test_image = Image.new('RGB', (800, 600), color='white')
        
        # Add some UI elements
        from PIL import ImageDraw
        draw = ImageDraw.Draw(test_image)
        
        # Header
        draw.rectangle([0, 0, 800, 60], fill='#4285f4')
        draw.text((320, 20), 'Test UI', fill='white')
        
        # Button
        draw.rectangle([300, 250, 500, 300], fill='#34a853')
        draw.text((365, 270), 'Click Me', fill='white')
        
        # Save temporarily
        test_image.save(test_image_path)
        print(f"📸 Created test UI image (800x600)")
        
        # Run prediction using the correct method
        print("🔮 Running saliency prediction...")
        result = analyzer.analyze_design(str(test_image_path))
        
        # Clean up
        test_image_path.unlink()
        
        if result:
            print(f"✅ Prediction successful!")
            print(f"   Score: {result.get('score', 'N/A')}")
            print(f"   Critical elements found: {len(result.get('critical_elements', []))}")
            print(f"   Issues found: {len(result.get('issues', []))}")
            print(f"   Cognitive load: {result.get('cognitive_load', {}).get('score', 'N/A')}")
            
            # Check if saliency heatmap was generated
            if 'saliency_heatmap' in result and result['saliency_heatmap']:
                print(f"✅ Saliency heatmap generated")
            
            # Check attention distribution
            if 'attention_distribution' in result:
                dist = result['attention_distribution']
                print(f"   Attention distribution: top={dist.get('top_region', 0):.2%}, " + 
                      f"center={dist.get('center_region', 0):.2%}")
            
            print("✅ Model is producing comprehensive analysis")
            return True
        else:
            print("❌ No result returned")
            return False
            
    except Exception as e:
        print(f"❌ Error testing prediction: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all verification checks"""
    print("\n" + "=" * 60)
    print("🔍 VERIFYING TRAINED MODEL INTEGRATION")
    print("=" * 60)
    
    # Step 1: Check model file
    model_path = check_model_file()
    if not model_path:
        print("\n" + "=" * 60)
        print("❌ VERIFICATION FAILED: Model file not found")
        print("=" * 60)
        return False
    
    # Step 2: Check model loading
    analyzer = check_model_loading(model_path)
    if not analyzer:
        print("\n" + "=" * 60)
        print("❌ VERIFICATION FAILED: Cannot load model")
        print("=" * 60)
        return False
    
    # Step 3: Check API integration
    api_ok = check_api_integration()
    
    # Step 4: Test prediction
    prediction_ok = test_prediction(analyzer)
    
    # Final summary
    print("\n" + "=" * 60)
    print("📊 VERIFICATION SUMMARY")
    print("=" * 60)
    print(f"✅ Model file exists: YES")
    print(f"✅ Model loads correctly: YES")
    print(f"{'✅' if api_ok else '⚠️ '} API integration: {'YES' if api_ok else 'PARTIAL'}")
    print(f"{'✅' if prediction_ok else '❌'} Model predictions: {'WORKING' if prediction_ok else 'FAILED'}")
    
    if api_ok and prediction_ok:
        print("\n" + "=" * 60)
        print("✅ SUCCESS: Web app is using the trained model!")
        print("=" * 60)
        print("\n💡 Next steps:")
        print("   1. Start backend: python -m uvicorn app.main:app --reload")
        print("   2. Start frontend: cd ../frontend && npm start")
        print("   3. Upload a design at http://localhost:3000")
        print("   4. The trained model will analyze the design!")
        return True
    else:
        print("\n" + "=" * 60)
        print("⚠️  PARTIAL: Model available but may have issues")
        print("=" * 60)
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
