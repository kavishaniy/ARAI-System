# Quick Deployment Checklist 🚀

## Phase 1: Railway Backend (15-20 minutes)

- [ ] Go to https://railway.app
- [ ] Click "Start New Project" → "Deploy from GitHub"
- [ ] Select **ARAI-System** repository
- [ ] Wait for auto-detection (Python project)
- [ ] Click **Variables** tab and add:
  ```
  PYTHONUNBUFFERED = 1
  ENVIRONMENT = production
  DEBUG = False
  SUPABASE_URL = [get from your account]
  SUPABASE_KEY = [get from your account]
  ALLOWED_ORIGINS = https://arai-system.vercel.app
  ```
- [ ] Watch **Deployments** tab - wait for ✅ Success
- [ ] Go to **Settings** → **Domains** → Copy public URL
- [ ] **SAVE THIS URL:** `https://arai-system-production.up.railway.app`

## Phase 2: Update Frontend Config (2 minutes)

In your code:

- [ ] Verify `/frontend/.env.production` contains:
  ```
  REACT_APP_API_URL=https://YOUR_RAILWAY_URL/api/v1
  ```

- [ ] Verify `/frontend/.nvmrc` contains:
  ```
  18.19.0
  ```

- [ ] Verify `/frontend/vercel.json` has:
  ```json
  "buildCommand": "CI=false npm run build",
  "nodeVersion": "18.x"
  ```

- [ ] Commit changes:
  ```bash
  git add .
  git commit -m "fix: configure deployment"
  git push origin main
  ```

## Phase 3: Vercel Frontend (10-15 minutes)

- [ ] Go to https://vercel.com/new
- [ ] Click **Import Project**
- [ ] Paste: `https://github.com/kavishaniy/ARAI-System`
- [ ] Click **Continue**
- [ ] Set **Root Directory** to: `./frontend`
- [ ] Add **Environment Variable:**
  ```
  REACT_APP_API_URL = https://YOUR_RAILWAY_URL/api/v1
  ```
  (Use the URL you saved from Railway!)
- [ ] Click **Deploy**
- [ ] Wait for ✅ Success (2-5 minutes)
- [ ] Click **Visit** to see your live site
- [ ] **SAVE THIS URL:** `https://arai-system.vercel.app`

## Phase 4: Verify Connection (5 minutes)

- [ ] Open your Vercel site in browser
- [ ] Open Developer Console (F12)
- [ ] Try to login - watch for API calls
- [ ] No CORS errors? ✅ You're good!

## Phase 5: Test End-to-End (5 minutes)

- [ ] Login to your app
- [ ] Upload a design/screenshot
- [ ] Run analysis
- [ ] Check if results appear
- [ ] All working? 🎉 You're done!

---

## Critical URLs to Save

| Name | URL | Status |
|------|-----|--------|
| Railway Backend | https://arai-system-production.up.railway.app | ⏳ Get after Phase 1 |
| Vercel Frontend | https://arai-system.vercel.app | ⏳ Get after Phase 3 |
| API Base | https://arai-system-production.up.railway.app/api/v1 | ⏳ Use in Phase 2 |

---

## Troubleshooting Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| Build hanging on Vercel | Already fixed! (`CI=false` set) |
| CORS errors | Check Vercel URL in Railway `ALLOWED_ORIGINS` |
| API not responding | Check Railway deployment status in logs |
| Environment var not working | Redeploy after adding var in Vercel Settings |
| "Cannot find module" | Run `npm ci` locally and commit `package-lock.json` |

---

## Total Time Estimate
- **Railway Setup:** 15-20 minutes ⏱️
- **Frontend Config:** 2 minutes ⏱️
- **Vercel Deployment:** 10-15 minutes ⏱️
- **Testing:** 5-10 minutes ⏱️
- **TOTAL:** ~45 minutes 🎯

---

**Start with Phase 1 (Railway) → Phase 2 (Config) → Phase 3 (Vercel) → Phase 4 (Verify) → Phase 5 (Test)**

Good luck! 🚀
