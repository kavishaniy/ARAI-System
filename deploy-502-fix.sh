#!/bin/bash

# 🚀 Quick Fix Deployment Script
# Run this to deploy the CORS/502 error fixes

echo "======================================"
echo "🔧 ARAI System - 502 Error Fix Deploy"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "   Current directory: $(pwd)"
    echo "   Expected: /Users/kavishani/Documents/FYP/arai-system"
    exit 1
fi

echo "📍 Current directory: $(pwd)"
echo ""

# Show what was changed
echo "📝 Files modified:"
echo "   ✓ frontend/src/components/Analysis/UploadAnalysis.jsx"
echo "     - Added automatic retry logic (3 attempts)"
echo "     - Added better error messages"
echo "     - Added visual retry feedback"
echo ""

# Check git status
echo "🔍 Checking git status..."
git status --short frontend/src/components/Analysis/UploadAnalysis.jsx
echo ""

# Ask for confirmation
read -p "Do you want to commit and push these changes? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

# Commit changes
echo "📦 Committing changes..."
git add frontend/src/components/Analysis/UploadAnalysis.jsx
git add FIX_502_ERROR_COMPLETE.md
git add test-backend-health.sh

git commit -m "fix: Add retry logic and better error handling for 502/network errors

- Implement automatic retry with exponential backoff for 502/503/504 errors
- Add user-friendly error messages explaining cold start behavior
- Display retry progress to users
- Increase timeout to 60 seconds for slow cold starts
- Fixes issue where Render free tier cold starts caused upload failures"

echo ""

# Push to trigger deployment
echo "🚀 Pushing to GitHub (this will trigger Vercel deployment)..."
git push origin main

echo ""
echo "======================================"
echo "✅ Deployment initiated!"
echo "======================================"
echo ""
echo "📊 What happens next:"
echo "   1. GitHub receives your changes"
echo "   2. Vercel automatically detects the push"
echo "   3. Vercel builds and deploys in ~1-2 minutes"
echo "   4. Your fixes will be live at: https://arai-system.vercel.app"
echo ""
echo "🔗 Monitor deployment:"
echo "   • Vercel Dashboard: https://vercel.com/dashboard"
echo "   • GitHub Actions: https://github.com/kavishaniy/ARAI-System/actions"
echo ""
echo "🧪 Test after deployment:"
echo "   1. Wait 20 minutes (let backend sleep)"
echo "   2. Go to https://arai-system.vercel.app/dashboard"
echo "   3. Upload a design"
echo "   4. You should see retry messages if backend is waking up"
echo ""
echo "💡 Tip: Run './test-backend-health.sh' to check backend status anytime"
echo ""
