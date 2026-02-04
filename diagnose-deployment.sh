#!/bin/bash

# ARAI Quick Diagnostics Script
# This will test your deployment URLs

echo "🔍 ARAI Deployment Diagnostics"
echo "================================"
echo ""

# Ask for URLs
read -p "Enter your Render backend URL (e.g., https://arai-backend-xxxx.onrender.com): " BACKEND_URL
read -p "Enter your Vercel frontend URL (e.g., https://arai-system.vercel.app): " FRONTEND_URL

# Remove trailing slashes
BACKEND_URL=${BACKEND_URL%/}
FRONTEND_URL=${FRONTEND_URL%/}

echo ""
echo "Testing with:"
echo "  Backend: $BACKEND_URL"
echo "  Frontend: $FRONTEND_URL"
echo ""

# Test 1: Backend Health
echo "📡 Test 1: Backend Health Check"
echo "================================"
HEALTH_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "${BACKEND_URL}/health" 2>&1)
HTTP_STATUS=$(echo "$HEALTH_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
HEALTH_BODY=$(echo "$HEALTH_RESPONSE" | grep -v "HTTP_STATUS")

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Backend is UP and responding!"
    echo "Response: $HEALTH_BODY"
else
    echo "❌ Backend health check failed!"
    echo "Status: $HTTP_STATUS"
    echo "Response: $HEALTH_BODY"
    echo ""
    echo "Possible issues:"
    echo "  1. Backend is sleeping (wait 30-60 seconds and run again)"
    echo "  2. Wrong URL - check your Render dashboard"
    echo "  3. Backend crashed - check Render logs"
    exit 1
fi
echo ""

# Test 2: API v1 endpoint
echo "📡 Test 2: API v1 Endpoint"
echo "================================"
API_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "${BACKEND_URL}/api/v1" 2>&1)
API_STATUS=$(echo "$API_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)

if [ "$API_STATUS" = "404" ]; then
    echo "⚠️ API v1 endpoint not found (404) - this is normal if there's no root endpoint"
elif [ "$API_STATUS" = "200" ]; then
    echo "✅ API v1 endpoint exists and responds"
else
    echo "ℹ️  API v1 endpoint status: $API_STATUS"
fi
echo ""

# Test 3: CORS Configuration
echo "📡 Test 3: CORS Configuration"
echo "================================"
CORS_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "${BACKEND_URL}/debug/cors" 2>&1)
CORS_STATUS=$(echo "$CORS_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
CORS_BODY=$(echo "$CORS_RESPONSE" | grep -v "HTTP_STATUS")

if [ "$CORS_STATUS" = "200" ]; then
    echo "✅ CORS debug endpoint accessible"
    echo "Current configuration:"
    echo "$CORS_BODY" | python3 -m json.tool 2>/dev/null || echo "$CORS_BODY"
    
    # Check if frontend URL is in allowed origins
    if echo "$CORS_BODY" | grep -q "$FRONTEND_URL"; then
        echo ""
        echo "✅ Your frontend URL IS in allowed origins!"
    elif echo "$CORS_BODY" | grep -q '"*"'; then
        echo ""
        echo "✅ CORS allows all origins (*)"
    else
        echo ""
        echo "❌ Your frontend URL is NOT in allowed origins!"
        echo "   You need to add: $FRONTEND_URL"
    fi
else
    echo "⚠️ Cannot access CORS debug endpoint (status: $CORS_STATUS)"
fi
echo ""

# Test 4: Auth endpoint
echo "📡 Test 4: Auth Endpoint Test"
echo "================================"
AUTH_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${BACKEND_URL}/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test","password":"test"}' 2>&1)
AUTH_STATUS=$(echo "$AUTH_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)

if [ "$AUTH_STATUS" = "401" ] || [ "$AUTH_STATUS" = "422" ]; then
    echo "✅ Auth endpoint is working (returned $AUTH_STATUS as expected for bad credentials)"
elif [ "$AUTH_STATUS" = "200" ]; then
    echo "✅ Auth endpoint is working"
else
    echo "⚠️ Auth endpoint status: $AUTH_STATUS"
fi
echo ""

# Summary and Next Steps
echo "================================"
echo "📋 SUMMARY & NEXT STEPS"
echo "================================"
echo ""

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Backend is operational!"
    echo ""
    echo "🔧 TO FIX YOUR NETWORK ERROR:"
    echo ""
    echo "1️⃣  UPDATE VERCEL ENVIRONMENT VARIABLE:"
    echo "   • Go to: https://vercel.com/dashboard"
    echo "   • Click your project → Settings → Environment Variables"
    echo "   • Set: REACT_APP_API_URL = ${BACKEND_URL}/api/v1"
    echo "   • Select all environments"
    echo "   • Click Save"
    echo "   • ⚠️ IMPORTANT: Go to Deployments → Click '...' → Redeploy"
    echo ""
    echo "2️⃣  UPDATE RENDER CORS:"
    echo "   • Go to: https://dashboard.render.com"
    echo "   • Click your backend → Environment tab"
    echo "   • Set: ALLOWED_ORIGINS = ${FRONTEND_URL},https://*.vercel.app"
    echo "   • Click Save Changes"
    echo ""
    echo "3️⃣  WAIT & TEST:"
    echo "   • Wait 2-3 minutes for both to redeploy"
    echo "   • Open: ${FRONTEND_URL}"
    echo "   • Open DevTools (F12) → Console tab"
    echo "   • Try analyzing a design"
    echo "   • Check for errors"
    echo ""
    echo "4️⃣  IF STILL NOT WORKING:"
    echo "   • Clear browser cache (Cmd+Shift+R)"
    echo "   • Try Incognito mode"
    echo "   • Share the error from browser console with me"
else
    echo "❌ Backend issues detected. Fix backend first before proceeding."
fi
echo ""
echo "💡 Need help? Share the output of this script with me!"
