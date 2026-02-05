#!/bin/bash

# Monitor Render Deployment Status

echo "🔍 Monitoring Render Deployment..."
echo "=================================="
echo ""

MAX_ATTEMPTS=60  # 5 minutes (60 attempts x 5 seconds)
ATTEMPT=0

echo "Waiting for Render to deploy the new version..."
echo "This usually takes 2-5 minutes"
echo ""

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    ATTEMPT=$((ATTEMPT + 1))
    
    # Check if backend is responding
    RESPONSE=$(curl -s https://arai-system.onrender.com/health 2>/dev/null)
    
    if [ -n "$RESPONSE" ]; then
        echo "[$ATTEMPT/$MAX_ATTEMPTS] ✅ Backend is responsive"
        
        # Check CORS debug endpoint
        CORS_DEBUG=$(curl -s https://arai-system.onrender.com/debug/cors 2>/dev/null)
        
        if echo "$CORS_DEBUG" | grep -q "backend_cors_origins"; then
            echo "[$ATTEMPT/$MAX_ATTEMPTS] 📊 CORS Configuration:"
            echo "$CORS_DEBUG" | python3 -m json.tool 2>/dev/null || echo "$CORS_DEBUG"
            
            # Check if new code is deployed (looking for dynamic CORS middleware)
            if echo "$CORS_DEBUG" | grep -q "vercel"; then
                echo ""
                echo "✅ SUCCESS! New code is deployed!"
                echo ""
                echo "🎉 You can now test on Vercel:"
                echo "   https://arai-system.vercel.app"
                echo ""
                echo "📝 Steps to test:"
                echo "   1. Open https://arai-system.vercel.app"
                echo "   2. Login with your credentials"
                echo "   3. Upload a design image"
                echo "   4. Should work without CORS error!"
                echo ""
                exit 0
            fi
        fi
    else
        echo "[$ATTEMPT/$MAX_ATTEMPTS] ⏳ Waiting for backend (may be sleeping or deploying)..."
    fi
    
    sleep 5
done

echo ""
echo "⚠️  Timeout after 5 minutes"
echo ""
echo "Please check manually:"
echo "1. Go to https://dashboard.render.com"
echo "2. Check your service deployment status"
echo "3. Look for any deployment errors in logs"
echo ""
