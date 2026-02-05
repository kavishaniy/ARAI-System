#!/bin/bash

echo "🔍 Testing backend health..."
echo ""

# Test main endpoint
echo "1️⃣ Testing main endpoint (/):"
curl -I https://arai-system.onrender.com/ 2>&1 | head -n 10
echo ""

# Test health endpoint
echo "2️⃣ Testing health endpoint (/health):"
curl -I https://arai-system.onrender.com/health 2>&1 | head -n 10
echo ""

# Test API endpoint
echo "3️⃣ Testing API endpoint (/api/v1):"
curl -I https://arai-system.onrender.com/api/v1 2>&1 | head -n 10
echo ""

# Test CORS preflight
echo "4️⃣ Testing CORS preflight (OPTIONS):"
curl -X OPTIONS https://arai-system.onrender.com/api/v1/analysis/upload \
  -H "Origin: https://arai-system.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: authorization,content-type" \
  -v 2>&1 | grep -i "access-control"
echo ""

echo "✅ Test complete!"
