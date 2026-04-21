# 🚀 Render Migration Checklist

## Before You Start
- [ ] GitHub account (you have this ✅)
- [ ] Vercel account (you have this ✅)
- [ ] All environment variables ready (saved in `backend/.env.render`)

---

## Step 1: Sign Up for Render (2 min)
- [ ] Go to https://render.com
- [ ] Click "Sign up with GitHub"
- [ ] Authorize and verify email
- [ ] You're in! ✅

---

## Step 2: Create Web Service (5 min)
- [ ] Click **New +** → **Web Service**
- [ ] Select **ARAI-System** repository
- [ ] Fill in:
  - Name: `arai-backend`
  - Environment: `Python 3`
  - Region: Choose your region
  - Branch: `main`
  - Build Command: `pip install -r backend/requirements.txt`
  - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  - Plan: **Free** or **Starter** ($7/mo)
- [ ] Click **Create Web Service**

---

## Step 3: Add Environment Variables (3 min)
- [ ] Go to **Environment** tab
- [ ] Copy all variables from `backend/.env.render`
- [ ] Paste into Render environment variables
- [ ] Save

---

## Step 4: Wait for Deployment (5 min)
- [ ] Watch the build logs
- [ ] Wait for "Your service is live" message
- [ ] Copy the **Public Domain** URL

---

## Step 5: Test Backend (1 min)
- [ ] Go to: `https://your-render-url/health`
- [ ] Should see: `{"status":"healthy"}`
- [ ] ✅ Backend is working!

---

## Step 6: Update Vercel Frontend (3 min)
- [ ] Go to https://vercel.com/dashboard
- [ ] Select **arai-system** project
- [ ] Settings → **Environment Variables**
- [ ] Update `REACT_APP_API_URL` to `https://your-render-url/api/v1`
- [ ] Save and deploy

---

## Step 7: Test Full App (2 min)
- [ ] Go to your Vercel frontend URL
- [ ] Try to load projects/analyze images
- [ ] Should work without CORS errors ✅

---

## Cleanup (Optional)
- [ ] Disable or delete Railway service
- [ ] Update any documentation with new URL
- [ ] Monitor Render dashboard for first week

---

## ⏱️ Total Time: ~20 minutes

**Status Check:**
- ✅ Backend on Render
- ✅ Frontend on Vercel
- ✅ Connected and working
- ✅ Problem solved! 🎉

---

## 📞 If Something Goes Wrong

| Issue | Solution |
|-------|----------|
| Build fails | Check `/backend/requirements.txt` exists |
| App crashes | View logs in Render, check environment vars |
| Frontend can't reach backend | Verify URL in Vercel env vars, test with curl |
| CORS errors | Check `ALLOWED_ORIGINS` includes your Vercel URL |
| Too slow (free tier) | Upgrade to Starter ($7/mo) for always-on |

---

**Let's do this!** 🚀
