# Deploy to Render - Step by Step Guide

## ✅ Step 1: Create Render Account

1. Go to https://render.com
2. Click **Sign up**
3. Choose **Sign up with GitHub** 
4. Authorize Render to access your GitHub repos
5. Done! You're logged in

---

## ✅ Step 2: Create New Web Service

1. Click **New +** (top right)
2. Select **Web Service**
3. Connect your GitHub account
4. Search for and select: **ARAI-System** repository
5. Click **Connect**

---

## ✅ Step 3: Configure the Service

Fill in these details:

| Field | Value |
|-------|-------|
| **Name** | `arai-backend` |
| **Environment** | `Python 3` |
| **Region** | Choose closest to you (Singapore, India, US East) |
| **Branch** | `main` |
| **Build Command** | `pip install -r backend/requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Plan** | **Free** (for testing) or **Starter** ($7/month for always-on) |

**Important:** Set Root Directory to `.` (root of repo)

---

## ✅ Step 4: Add Environment Variables

After clicking **Create Web Service**, go to the **Environment** tab:

Copy and paste all these variables:

```
SUPABASE_URL=https://omguovoobfiuaooupzsw.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tZ3Vvdm9vYmZpdWFvb3VwenN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MDY1NjAsImV4cCI6MjA4NTE4MjU2MH0.BRRME2aqnHXqotxoY045SUDchaZ5govCikVOF1HtEeU
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tZ3Vvdm9vYmZpdWFvb3VwenN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYwNjU2MCwiZXhwIjoyMDg1MTgyNTYwfQ.Pad--fqML_zfXONlyKG6tC3O6G0ZJR1blJ6NbWStqH8
SECRET_KEY=sb_secret_7fmbD60R0bYRGtrL81hA1Q_VLWdN0W6
SESSION_SECRET_KEY=arai_session_secret_key_change_in_production
FIGMA_API_TOKEN=figd_LULtMcOVu8m1uy_eO3DDYQCI4vguojh2A1IvEku9
FIGMA_CLIENT_ID=0zUuRy2IrZ4IeA98hRRhF8
FIGMA_CLIENT_SECRET=gCva505ietO1MLe0JpJfj4V2Owwz6n
ENVIRONMENT=production
DEBUG=False
ALLOWED_ORIGINS=https://arai-system.vercel.app,https://arai-system-git-main-kavishaniy.vercel.app,https://arai-system-kavishaniy.vercel.app
FRONTEND_URL=https://arai-system.vercel.app
PYTHONUNBUFFERED=1
```

---

## ✅ Step 5: Deploy

1. Click **Create Web Service** button
2. Render will start building and deploying
3. Wait for the deployment to complete (2-5 minutes)
4. You'll see **"Your service is live"** when done

---

## ✅ Step 6: Get Your Backend URL

1. Go to your service page
2. Look for **Public Domain** at the top
3. Copy the URL (e.g., `https://arai-backend.onrender.com`)
4. Test it: `https://arai-backend.onrender.com/health`
   - Should return: `{"status":"healthy"}`

---

## ✅ Step 7: Update Vercel Frontend

1. Go to https://vercel.com/dashboard
2. Select your **ARAI frontend project**
3. Go to **Settings** → **Environment Variables**
4. Find or create: `REACT_APP_API_URL`
5. Update value: `https://arai-backend.onrender.com/api/v1` (replace with your actual Render URL)
6. Click **Save**
7. Vercel will auto-redeploy the frontend

---

## ✅ Step 8: Test Everything

Test in browser:
```
https://arai-system.vercel.app
```

Should work without CORS errors now! ✅

---

## 🎉 All Done!

Your app is now on Render with:
- ✅ Stable Python backend
- ✅ Auto-deploy on git push
- ✅ All environment variables configured
- ✅ Connected to Vercel frontend

---

## 💡 Tips

- **Free tier:** App sleeps after 15 min inactivity (first request takes 30-60 sec)
- **Paid tier ($7/mo):** Always-on, instant responses, recommended for production
- **Auto-deploy:** Every push to `main` branch auto-deploys
- **Logs:** View logs in Render dashboard if issues occur

---

## ❌ Troubleshooting

**If deployment fails:**
1. Check Build logs in Render dashboard
2. Ensure `requirements.txt` exists in `/backend/` directory
3. Verify Python version (should be 3.11)

**If app crashes after deployment:**
1. Check Environment Variables are all set
2. View logs in Render dashboard
3. Ensure Supabase credentials are correct

**If frontend can't reach backend:**
1. Verify `REACT_APP_API_URL` is correct in Vercel
2. Check Render backend is responding: `https://your-render-url/health`
3. Check browser console for CORS errors

---

**Need help? Let me know!** 🚀
