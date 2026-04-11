# Vercel Deployment Troubleshooting Checklist

## ✅ Pre-Deployment Checks

- [x] **Environment variable set locally:** `REACT_APP_API_URL=https://arai-system-production.up.railway.app/api/v1`
- [x] **Local build successful:** `npm run build` completes with only minor warnings
- [x] **All API URLs use environment variable:** Found in `api.js`, `UploadAnalysis.jsx`, `constants.js`

## 📋 Vercel-Specific Configuration

### Required Steps:

1. **Add Environment Variable to Vercel Dashboard:**
   ```
   Go to: https://vercel.com → Your Project → Settings → Environment Variables
   
   Variable Name:  REACT_APP_API_URL
   Value:          https://arai-system-production.up.railway.app/api/v1
   Environments:   ✓ Production  ✓ Preview  ✓ Development
   ```

2. **Rebuild After Adding Environment Variable:**
   - After adding the env var, trigger a new deployment
   - Either by pushing to GitHub or clicking "Redeploy" in Vercel dashboard

3. **Verify Railway Backend is Running:**
   - Test: `curl https://arai-system-production.up.railway.app/api/v1/health`
   - Should return a response (not 404 or timeout)

## 🔍 Common Vercel Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `REACT_APP_API_URL is not defined` | Missing env var in Vercel | Add to Settings → Environment Variables |
| `Build timed out` | Build takes >15 minutes | Check for large dependencies, use caching |
| `Module not found` | Missing dependency | Run `npm install` locally, commit `package-lock.json` |
| `CORS error in browser` | Backend not accessible | Check Railway is deployed, verify CORS headers |
| `Cannot GET /` | Rewrite rule issue | Verify `vercel.json` rewrite is correct |

## 🚀 Quick Debug Steps

### 1. Check Vercel Build Logs
- Open your Vercel deployment
- Click "View Logs" to see the full build output
- Look for the specific error message

### 2. Test Build Locally
```bash
cd frontend
npm ci  # Clean install
npm run build  # Build
```

### 3. Check Environment Variables in Vercel
```
Dashboard → Settings → Environment Variables
Confirm: REACT_APP_API_URL is listed
```

### 4. Test Railway Backend Connectivity
```bash
# Test if Railway is accessible
curl -I https://arai-system-production.up.railway.app/api/v1/health

# If Railway responds, the issue is elsewhere
# If Railway times out, it's not deployed or running
```

## 📝 Files to Check

- ✅ `frontend/.env.production` - Has Railway URL
- ✅ `frontend/vercel.json` - Has correct rewrite rules
- ✅ `frontend/package.json` - Build command is correct
- ✅ `frontend/src/services/api.js` - Uses REACT_APP_API_URL
- ✅ `frontend/.vercelignore` - Not ignoring build artifacts

## 🆘 Next Steps

Please provide the **exact error message** from Vercel's deployment log and I can give you a targeted fix!

To share the error:
1. Go to https://vercel.com → Your Project
2. Click on the failed deployment
3. Scroll down to "Build" section
4. Copy the error message and share it
