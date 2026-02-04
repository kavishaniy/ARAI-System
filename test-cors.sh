#!/bin/bash

echo "🧪 Testing CORS Configuration..."
echo ""
echo "1️⃣ Testing OPTIONS preflight request:"
curl -X OPTIONS https://arai-system.onrender.com/api/v1/analysis/upload \
  -H "Origin: https://arai-system.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: authorization,content-type" \
  -i -s | grep -i "access-control"

echo ""
echo "2️⃣ Testing CORS debug endpoint:"
curl -s https://arai-system.onrender.com/debug/cors | python3 -m json.tool

echo ""
echo "✅ If you see 'access-control-allow-origin' headers above, CORS is working!"
