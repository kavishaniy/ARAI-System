#!/bin/bash

echo "🧪 Testing CORS Configuration..."
echo ""
echo "Frontend URL: https://frontend-seven-alpha-91.vercel.app"
echo "Backend URL: https://arai-system-production.up.railway.app"
echo ""
echo "Testing CORS..."
echo ""

curl -X OPTIONS https://arai-system-production.up.railway.app/api/v1/auth/signup \
  -H "Origin: https://frontend-seven-alpha-91.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -i 2>&1 | grep -E "(HTTP/|access-control-allow-origin|Disallowed)"

echo ""
echo ""
echo "✅ Expected Result:"
echo "   HTTP/2 200"
echo "   access-control-allow-origin: https://frontend-seven-alpha-91.vercel.app"
echo ""
echo "❌ Current Error:"
echo "   HTTP/2 400"
echo "   Disallowed CORS origin"
echo ""
echo "👉 Fix: Set ALLOWED_ORIGINS in Railway to https://frontend-seven-alpha-91.vercel.app"
