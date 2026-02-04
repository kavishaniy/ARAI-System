#!/bin/bash

# Quick check script
echo "📦 Current bundle: $(curl -s https://arai-system.vercel.app | grep -o 'static/js/main\.[a-z0-9]*\.js' | head -1)"
echo ""
echo "⏰ Pushed to GitHub: ~1 minute ago"
echo ""
echo "🔄 Expected: Vercel should start deploying in 1-2 minutes"
echo ""
echo "👉 To monitor deployment:"
echo "   ./monitor-deployment.sh"
echo ""
echo "👉 Or check manually:"
echo "   https://vercel.com/dashboard"
echo ""
echo "⚠️  If after 5 minutes it's still not deployed:"
echo "   Read: MANUAL_FIX_VERCEL.md"
