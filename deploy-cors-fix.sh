#!/bin/bash

# CORS Fix Deployment Script
# This script helps deploy the CORS fixes to both frontend and backend

echo "🚀 ARAI System - CORS Fix Deployment"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in git repository root"
    echo "Please run this script from /Users/kavishani/Documents/FYP/arai-system"
    exit 1
fi

echo "📝 Checking git status..."
git status

echo ""
echo "📦 Files to be committed:"
git diff --name-only HEAD

echo ""
read -p "Do you want to commit and push these changes? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo ""
    echo "✅ Committing changes..."
    git add backend/app/main.py
    git add frontend/src/services/auth.js
    git add frontend/src/services/api.js
    git add frontend/src/components/Analysis/UploadAnalysis.jsx
    git add frontend/src/components/Auth/Login.jsx
    git add CORS_FIX_GUIDE.md
    git add TOKEN_EXPIRY_FIX.md
    
    git commit -m "Fix: Add dynamic CORS middleware and token expiry handling

- Add dynamic CORS middleware to handle Vercel preview URLs
- Pattern match all *.vercel.app domains for preview deployments
- Add proper OPTIONS preflight request handling
- Implement token expiry detection and automatic session cleanup
- Add user-friendly error messages and redirect handling
- Improve error handling for network issues

Fixes: CORS errors and 401 token expiry issues on Vercel deployment"
    
    echo ""
    echo "📤 Pushing to GitHub..."
    git push origin main
    
    echo ""
    echo "✅ Deployment initiated!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Wait for Render to auto-deploy (2-5 minutes)"
    echo "   Check: https://dashboard.render.com"
    echo ""
    echo "2. Vercel will auto-deploy frontend (1-2 minutes)"
    echo "   Check: https://vercel.com/dashboard"
    echo ""
    echo "3. Monitor Render logs for CORS configuration:"
    echo "   🔧 CORS Configuration:"
    echo "   ✅ Allowing Vercel preview URL: ..."
    echo ""
    echo "4. Test on Vercel:"
    echo "   https://arai-system.vercel.app"
    echo ""
    echo "5. If CORS error persists:"
    echo "   - Wait 5 more minutes for Render to fully deploy"
    echo "   - Hard refresh browser (Cmd+Shift+R)"
    echo "   - Check Render logs for deployment status"
    echo "   - Verify environment variables on Render dashboard"
    echo ""
else
    echo ""
    echo "❌ Deployment cancelled"
    echo ""
    echo "To deploy manually:"
    echo "  git add backend/app/main.py frontend/src/"
    echo "  git commit -m 'Fix: CORS and token expiry issues'"
    echo "  git push origin main"
fi

echo ""
echo "📚 For detailed information, see:"
echo "  - CORS_FIX_GUIDE.md"
echo "  - TOKEN_EXPIRY_FIX.md"
echo ""
