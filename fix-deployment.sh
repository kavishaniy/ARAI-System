#!/bin/bash

# Quick Fix Script for Network Error
# Run this after deployment issues

echo "🔧 ARAI Deployment Fix Script"
echo "================================"
echo ""

# Get URLs from user
read -p "Enter your Render BACKEND URL (e.g., https://arai-backend-xxxx.onrender.com): " BACKEND_URL
read -p "Enter your Vercel FRONTEND URL (e.g., https://arai-system.vercel.app): " FRONTEND_URL

# Remove trailing slashes
BACKEND_URL=${BACKEND_URL%/}
FRONTEND_URL=${FRONTEND_URL%/}

echo ""
echo "📝 URLs configured:"
echo "   Backend: $BACKEND_URL"
echo "   Frontend: $FRONTEND_URL"
echo ""

# Update .env.production
echo "✏️  Updating frontend/.env.production..."
cat > frontend/.env.production << EOF
REACT_APP_API_URL=${BACKEND_URL}/api/v1
EOF

echo "✅ Updated frontend/.env.production"
echo ""

# Show Vercel instructions
echo "📋 NEXT STEPS FOR VERCEL:"
echo "================================"
echo ""
echo "1. Go to: https://vercel.com/dashboard"
echo "2. Click on your project"
echo "3. Go to: Settings → Environment Variables"
echo "4. Update/Add this variable:"
echo ""
echo "   Name:  REACT_APP_API_URL"
echo "   Value: ${BACKEND_URL}/api/v1"
echo ""
echo "5. Select all environments (Production, Preview, Development)"
echo "6. Click 'Save'"
echo "7. Go to: Deployments tab"
echo "8. Click '...' on latest deployment"
echo "9. Click 'Redeploy'"
echo ""

# Show Render instructions
echo "📋 NEXT STEPS FOR RENDER:"
echo "================================"
echo ""
echo "1. Go to: https://dashboard.render.com"
echo "2. Click on your backend service"
echo "3. Go to: Environment tab"
echo "4. Update/Add this variable:"
echo ""
echo "   Name:  ALLOWED_ORIGINS"
echo "   Value: ${FRONTEND_URL},https://*.vercel.app"
echo ""
echo "5. Click 'Save Changes'"
echo "6. Wait for redeploy to complete"
echo ""

# Commit changes
echo "💾 Committing changes..."
git add frontend/.env.production
git commit -m "fix: Update frontend environment for production deployment"
git push

echo ""
echo "✅ Local changes committed and pushed!"
echo ""
echo "🧪 TESTING:"
echo "================================"
echo ""
echo "1. Test backend health:"
echo "   Open: ${BACKEND_URL}/health"
echo "   Expected: {\"status\":\"healthy\"}"
echo ""
echo "2. Test CORS config:"
echo "   Open: ${BACKEND_URL}/debug/cors"
echo ""
echo "3. After Vercel redeploy, test your app:"
echo "   Open: ${FRONTEND_URL}"
echo "   - Sign in"
echo "   - Upload an image"
echo "   - Click Analyze Design"
echo ""
echo "4. Check browser console (F12) for errors"
echo ""
echo "✨ Done! Follow the steps above to complete the fix."
