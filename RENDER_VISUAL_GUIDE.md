# 🎬 Visual Step-by-Step: Render Setup

## Step 1: Sign Up at Render

```
Visit: https://render.com

┌─────────────────────────────────────┐
│  Sign up with GitHub                │
│  [Authorize render-oss]             │
│  [Verify Email]                     │
└─────────────────────────────────────┘
     ↓
You're logged in! ✅
```

---

## Step 2: Create New Web Service

```
Dashboard → New + → Web Service

┌─────────────────────────────────────┐
│  Connect Repository                 │
│  ✓ ARAI-System                      │
│  ✓ kavishaniy/ARAI-System           │
│  [Connect]                          │
└─────────────────────────────────────┘
     ↓
Select your repo!
```

---

## Step 3: Fill in Service Details

```
┌─────────────────────────────────────┐
│  Name:            arai-backend      │
│  Environment:     Python 3          │
│  Region:          Singapore         │
│  Branch:          main              │
│                                     │
│  Build Command:                     │
│  pip install -r backend/requirements.txt
│                                     │
│  Start Command:                     │
│  uvicorn app.main:app --host 0.0.0.0 --port $PORT
│                                     │
│  Plan: ○ Free  ● Starter ($7/mo)   │
│                                     │
│  [Create Web Service]               │
└─────────────────────────────────────┘
     ↓
Click button! Service starts building...
```

---

## Step 4: Add Environment Variables

```
While building → Environment tab

┌─────────────────────────────────────┐
│  Add Environment Variables          │
│                                     │
│  SUPABASE_URL=...                   │
│  SUPABASE_KEY=...                   │
│  SUPABASE_SERVICE_KEY=...           │
│  SECRET_KEY=...                     │
│  FIGMA_API_TOKEN=...                │
│  ... (more vars below)              │
│                                     │
│  [Save]                             │
└─────────────────────────────────────┘

Tip: Copy all from backend/.env.render
```

---

## Step 5: Wait for Deployment

```
Render builds automatically:

[████████░░░░░░░░░░░░░░░░] Building...

Build logs show:
✓ Installing Python 3.13
✓ Installing requirements
✓ Deploying service
✓ Service is live!

Status: LIVE ✅ (2-5 minutes)
```

---

## Step 6: Get Your Backend URL

```
Service Page:

┌─────────────────────────────────────┐
│  arai-backend        [LIVE] ✅      │
│                                     │
│  Public Domain:                     │
│  https://arai-backend.onrender.com  │
│                                     │
│  [Copy]                             │
└─────────────────────────────────────┘

Save this URL! You need it next.
```

---

## Step 7: Test Backend

```
Open in browser:
https://arai-backend.onrender.com/health

Response:
{"status":"healthy"}

✅ Backend is working!
```

---

## Step 8: Update Vercel

```
Vercel Dashboard
  ↓
Your Project → Settings → Environment Variables

┌─────────────────────────────────────┐
│  REACT_APP_API_URL                  │
│  https://arai-backend.onrender.com/api/v1
│                                     │
│  [Save]                             │
│  [Redeploy]                         │
└─────────────────────────────────────┘

Wait for redeploy... (2-3 minutes)
```

---

## Step 9: Test Full App

```
Open browser:
https://arai-system.vercel.app

Try to:
✓ Log in
✓ Create/load project
✓ Analyze an image

Everything works! 🎉
```

---

## 📊 Architecture Diagram

```
BEFORE (Railway - ❌ Crashes):
┌─────────────┐         ┌──────────────┐
│  Vercel     │ ----->  │  Railway     │
│  Frontend   │         │  Backend     │
│             │         │  (Crashes!)  │
└─────────────┘         └──────────────┘

AFTER (Render - ✅ Stable):
┌─────────────┐         ┌──────────────┐
│  Vercel     │ ----->  │  Render      │
│  Frontend   │         │  Backend     │
│             │         │  (Stable!)   │
└─────────────┘         └──────────────┘
                               ↓
                        ┌──────────────┐
                        │  Supabase    │
                        │  Database    │
                        └──────────────┘
```

---

## ✅ Success Checklist

After following all steps:

- [x] Render account created
- [x] Web Service created
- [x] Build succeeded
- [x] Environment variables set
- [x] Backend URL obtained
- [x] Vercel updated
- [x] Frontend redeployed
- [x] Tests passing
- [x] App working! 🎉

---

## 🎯 Summary

| What | Before | After |
|------|--------|-------|
| **Host** | Railway | Render |
| **Status** | ❌ Crashes | ✅ Stable |
| **Cost** | $5+/mo | $7/mo |
| **Setup** | 30 min | 20 min |
| **Reliability** | Low | High |

---

**You're all set!** Go to https://render.com and start building! 🚀
