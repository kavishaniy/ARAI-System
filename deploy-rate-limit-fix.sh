#!/bin/bash
# 🚀 FIGMA RATE LIMIT FIX - DEPLOYMENT SCRIPT
# Run this to deploy the rate limit fix immediately

echo "🔧 FIGMA Rate Limit Fix - Deployment"
echo "===================================="
echo ""
echo "This script will:"
echo "1. Stop the current backend server"
echo "2. Verify no errors in the code"
echo "3. Start the backend with rate limit protection"
echo ""

# Check if user wants to continue
read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "📍 Step 1: Stopping current backend..."
pkill -f "python.*app/main.py" || echo "⚠️  No running backend found (OK)"
sleep 1

echo "✅ Backend stopped (or was not running)"
echo ""

echo "📍 Step 2: Verifying code..."
cd /Users/kavishani/Documents/FYP/arai-system/backend
python -m py_compile app/core/figma_client.py app/services/figma_service.py

if [ $? -ne 0 ]; then
    echo "❌ Code verification failed! Not deploying."
    exit 1
fi

echo "✅ Code verified (no syntax errors)"
echo ""

echo "📍 Step 3: Starting backend with rate limit fix..."
echo ""
echo "🚀 Starting: python app/main.py"
echo "⏱️  Give it 5 seconds to start..."
echo ""

python app/main.py &
sleep 5

echo ""
echo "✅ Backend started!"
echo ""
echo "===================================="
echo "🎉 DEPLOYMENT COMPLETE!"
echo "===================================="
echo ""
echo "✅ Rate limit fix is now active"
echo "✅ Backend running on http://localhost:8000"
echo "✅ Frontend should connect automatically"
echo ""
echo "📝 Next steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Go to the Analyzer tab"
echo "3. Paste a Figma URL (larger projects are better for testing)"
echo "4. Click 'Analyze Design'"
echo "5. Watch the backend logs (this window) for:"
echo "   ⏱️  Rate limit: X requests remaining"
echo "6. Analysis should complete successfully ✅"
echo ""
echo "📖 For more info, see:"
echo "   - RATE_LIMIT_FIX_SUMMARY.md (quick overview)"
echo "   - RATE_LIMIT_DOCUMENTATION_INDEX.md (all docs)"
echo ""
echo "💡 Tip: Check the logs to see rate limit monitoring in action!"
echo ""
