#!/bin/bash

echo "🔍 Checking if Vercel deployment has been fixed..."
echo ""

# Get the main JS bundle name
BUNDLE=$(curl -s https://arai-system.vercel.app | grep -o 'static/js/main.[a-z0-9]*\.js' | head -1)

if [ -z "$BUNDLE" ]; then
    echo "❌ Could not find JavaScript bundle"
    exit 1
fi

echo "Found bundle: $BUNDLE"
echo ""

# Check for localhost
HAS_LOCALHOST=$(curl -s "https://arai-system.vercel.app/$BUNDLE" | grep -c 'localhost:8000')

# Check for production URL
HAS_RENDER=$(curl -s "https://arai-system.vercel.app/$BUNDLE" | grep -c 'arai-system.onrender.com')

echo "Results:"
echo "========"

if [ $HAS_LOCALHOST -gt 0 ]; then
    echo "❌ STILL HAS LOCALHOST ($HAS_LOCALHOST occurrences)"
    echo ""
    echo "This means the environment variable is NOT working!"
    echo ""
    echo "DO THIS:"
    echo "1. Go to Vercel Dashboard"
    echo "2. Your Project → Settings → Environment Variables"
    echo "3. DELETE the REACT_APP_API_URL variable if it exists"
    echo "4. Add it again: REACT_APP_API_URL = https://arai-system.onrender.com/api/v1"
    echo "5. Check ALL 3 boxes (Production, Preview, Development)"
    echo "6. Save"
    echo "7. Deployments → Redeploy"
    echo "8. Wait for Ready"
    echo "9. Run this script again"
else
    echo "✅ NO localhost found - GOOD!"
fi

if [ $HAS_RENDER -gt 0 ]; then
    echo "✅ HAS production URL ($HAS_RENDER occurrences) - GOOD!"
else
    echo "⚠️  No production URL found"
fi

echo ""

if [ $HAS_LOCALHOST -eq 0 ] && [ $HAS_RENDER -gt 0 ]; then
    echo "🎉 SUCCESS! Your deployment is correctly configured!"
    echo "You can now test your app at: https://arai-system.vercel.app"
else
    echo "❌ STILL NOT FIXED - Follow the steps above"
fi
