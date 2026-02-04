
# 🚀 VERCEL DEPLOYMENT CHECKLIST

## ⚠️ DO THESE STEPS IN ORDER:

### ☐ 1. SET ENVIRONMENT VARIABLE IN VERCEL
**This is THE MOST CRITICAL step!**

→ Go to: https://vercel.com/dashboard
→ Click your project
→ Settings → Environment Variables
→ Add:
   Key: `REACT_APP_API_URL`
   Value: `https://arai-system.onrender.com/api/v1`
   Environments: ✓ Production ✓ Preview ✓ Development
→ Click SAVE

### ☐ 2. DEPLOY CODE CHANGES
```bash
cd /Users/kavishani/Documents/FYP/arai-system
git add .
git commit -m "Fix: Vercel deployment"
git push origin main
```

### ☐ 3. WAIT FOR DEPLOYMENT
→ Vercel dashboard → Deployments
→ Wait for "Ready" status (2-3 min)

### ☐ 4. CLEAR BROWSER CACHE
→ Mac: Cmd + Shift + R
→ Windows: Ctrl + Shift + R

### ☐ 5. TEST DEBUG PAGE
→ Visit: https://arai-system.vercel.app/debug.html
→ Check: Environment Variables show "✓ Found"
→ Check: API Connection shows "✓ Connected"

### ☐ 6. TEST MAIN SITE
→ Visit: https://arai-system.vercel.app
→ Should show login page (not blank screen)
→ Press F12 and check Console for "App mounted"

---

## 🆘 STILL NOT WORKING?

1. Did you actually click SAVE on the environment variable? (Step 1)
2. Did you wait for deployment to complete? (Step 3)
3. Did you hard refresh? (Step 4)
4. Take screenshot of debug page and share

## 🔗 Quick Links

- Vercel Dashboard: https://vercel.com/dashboard
- Your Site: https://arai-system.vercel.app
- Debug Page: https://arai-system.vercel.app/debug.html
- Full Instructions: See VERCEL_FIX.md
