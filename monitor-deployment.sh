#!/bin/bash

# 🔄 VERCEL DEPLOYMENT CHECKER
# This script monitors your Vercel deployment and checks when the fix is applied

echo "🚀 Monitoring Vercel deployment for the fix..."
echo ""
echo "Pushed to GitHub at: $(date)"
echo ""
echo "Expected timeline:"
echo "  +30s  - Vercel detects push"
echo "  +1m   - Build starts"
echo "  +2-3m - Build completes"
echo "  +3m   - Deployment ready"
echo ""

# Function to check the bundle
check_bundle() {
    local bundle=$(curl -s https://arai-system.vercel.app | grep -o 'static/js/main\.[a-z0-9]*\.js' | head -1)
    echo "$bundle"
}

# Function to check for localhost
check_localhost() {
    local bundle=$1
    local count=$(curl -s "https://arai-system.vercel.app/$bundle" | grep -c "localhost:8000" || echo "0")
    echo "$count"
}

# Initial bundle
INITIAL_BUNDLE=$(check_bundle)
echo "📦 Current bundle: $INITIAL_BUNDLE"
echo ""
echo "⏳ Waiting for Vercel to deploy new version..."
echo "   (This will automatically check every 30 seconds)"
echo ""

COUNTER=0
MAX_CHECKS=12  # 6 minutes max

while [ $COUNTER -lt $MAX_CHECKS ]; do
    sleep 30
    COUNTER=$((COUNTER + 1))
    
    CURRENT_BUNDLE=$(check_bundle)
    
    if [ "$CURRENT_BUNDLE" != "$INITIAL_BUNDLE" ]; then
        echo "✅ NEW DEPLOYMENT DETECTED!"
        echo "📦 New bundle: $CURRENT_BUNDLE"
        echo ""
        
        # Wait a bit more for bundle to be fully available
        sleep 10
        
        # Check for localhost
        LOCALHOST_COUNT=$(check_localhost "$CURRENT_BUNDLE")
        
        if [ "$LOCALHOST_COUNT" -eq 0 ]; then
            echo "🎉 SUCCESS! No localhost found!"
            echo ""
            echo "✅ The fix has been applied!"
            echo ""
            echo "Next steps:"
            echo "1. Open Incognito window: https://arai-system.vercel.app"
            echo "2. Hard refresh: Cmd + Shift + R"
            echo "3. Sign in and test upload/analysis"
            echo ""
            echo "If you still see issues:"
            echo "- Clear browser cache completely"
            echo "- Check CORS on Render: https://arai-system.onrender.com/debug/cors"
            exit 0
        else
            echo "⚠️  New deployment found but still has localhost!"
            echo "   This might be a cache issue. Running full check..."
            ./verify-vercel-fix.sh
            exit 1
        fi
    else
        echo "[$(date +%H:%M:%S)] Check $COUNTER/$MAX_CHECKS - Still waiting... (bundle unchanged)"
    fi
done

echo ""
echo "⏱️  Timeout reached (6 minutes)"
echo ""
echo "❌ Deployment taking longer than expected."
echo ""
echo "Please do this manually:"
echo "1. Go to: https://vercel.com/dashboard"
echo "2. Click on your 'arai-system' project"
echo "3. Check 'Deployments' tab"
echo "4. Look for the status of the latest deployment"
echo ""
echo "If deployment failed:"
echo "  - Click on the deployment to see error logs"
echo "  - Share the error with me"
echo ""
echo "If deployment is still building:"
echo "  - Wait a bit more and run this script again"
echo ""
echo "If deployment succeeded but bundle unchanged:"
echo "  - This means Vercel isn't picking up the .env file"
echo "  - We'll need to set it directly in Vercel dashboard"
