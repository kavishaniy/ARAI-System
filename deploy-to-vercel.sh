#!/bin/bash

echo "🚀 Deploying ARAI System to Vercel..."
echo ""

# Navigate to project root
cd "$(dirname "$0")"

# Check if changes need to be committed
if [[ -n $(git status -s) ]]; then
    echo "📝 Committing changes..."
    git add .
    git commit -m "Fix: Resolve blank screen issue on Vercel deployment"
    echo "✅ Changes committed"
else
    echo "ℹ️  No changes to commit"
fi

# Push to main branch
echo ""
echo "⬆️  Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Done! Vercel will automatically deploy your changes."
echo ""
echo "⏰ Wait 2-3 minutes for deployment to complete"
echo ""
echo "📋 CRITICAL: Set environment variable in Vercel Dashboard"
echo "   1. Go to: https://vercel.com/dashboard"
echo "   2. Select your project: arai-system"
echo "   3. Settings → Environment Variables"
echo "   4. Add: REACT_APP_API_URL = https://arai-system.onrender.com/api/v1"
echo "   5. Save and redeploy if necessary"
echo ""
echo "🔍 Check deployment at: https://arai-system.vercel.app"
echo "🐛 View logs at: https://vercel.com/dashboard (Deployments → Latest)"
echo ""
