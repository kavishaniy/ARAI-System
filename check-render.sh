#!/bin/bash

# Quick check to see if Render deployment is working

echo "🔍 Checking Render Deployment Status..."
echo "========================================"
echo ""

MAX_ATTEMPTS=40
ATTEMPT=0
SUCCESS=false

echo "⏳ Waiting for Render to deploy (this takes 5-10 minutes)..."
echo ""

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    ATTEMPT=$((ATTEMPT + 1))
    ELAPSED=$((ATTEMPT * 15))
    MINUTES=$((ELAPSED / 60))
    
    echo -n "[$MINUTES min] Attempt $ATTEMPT/$MAX_ATTEMPTS: "
    
    # Try to hit health endpoint
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://arai-system.onrender.com/health 2>/dev/null)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ Backend is UP!"
        
        # Get health response
        HEALTH=$(curl -s https://arai-system.onrender.com/health 2>/dev/null)
        echo "   Response: $HEALTH"
        
        SUCCESS=true
        break
    elif [ "$HTTP_CODE" = "000" ]; then
        echo "⏳ Service not responding (deploying or sleeping)..."
    else
        echo "❌ HTTP $HTTP_CODE"
    fi
    
    # Only wait if not the last attempt
    if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
        sleep 15
    fi
done

echo ""
echo "========================================"

if [ "$SUCCESS" = true ]; then
    echo "✅ DEPLOYMENT SUCCESSFUL!"
    echo ""
    echo "🎉 Your backend is now live!"
    echo ""
    echo "📝 Next Steps:"
    echo "1. Open: https://arai-system.vercel.app"
    echo "2. Login with your credentials"
    echo "3. Upload a design image"
    echo "4. First upload will be slow (loading AI models)"
    echo "5. Subsequent uploads will be faster"
    echo ""
    echo "🔍 To check CORS config:"
    echo "   curl https://arai-system.onrender.com/debug/cors"
    echo ""
    echo "📊 To monitor Render logs:"
    echo "   Go to: https://dashboard.render.com"
    echo "   Click on your service → Logs tab"
    echo ""
else
    echo "⚠️ Could not verify deployment after $MINUTES minutes"
    echo ""
    echo "🔍 Manual Check Required:"
    echo "1. Go to: https://dashboard.render.com"
    echo "2. Check your service status"
    echo "3. Look at the Logs tab for errors"
    echo ""
    echo "Common Issues:"
    echo "- Still deploying (wait a bit more)"
    echo "- Build failed (check logs for errors)"
    echo "- Service sleeping (first request wakes it)"
    echo ""
    echo "Try manually:"
    echo "   curl https://arai-system.onrender.com/health"
    echo ""
fi
