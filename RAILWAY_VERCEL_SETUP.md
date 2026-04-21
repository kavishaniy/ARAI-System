# ✅ Vercel & Railway Connection Setup

## 🔧 What Was Fixed

1. **Backend crash cause**: Missing Supabase environment variables in Railway
2. **Frontend .env files**: Fixed incorrect API URLs
3. **Config**: Made Supabase variables optional to prevent startup crashes

## 📋 Next Steps - CRITICAL

### 1️⃣ Add Environment Variables to Railway

Go to [Railway Dashboard](https://railway.app/dashboard):

1. Select your **backend** service
2. Click **Variables** tab
3. Add these environment variables (copy from `backend/.env.railway`):

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
```

### 2️⃣ Deploy Backend to Railway

```bash
cd /Users/kavishani/Documents/FYP/arai-system
railway login
railway link  # Select your project
railway deploy
```

Wait for deployment to complete. Check the Railway logs to confirm it's healthy.

### 3️⃣ Get Your Railway Backend URL

After deployment succeeds:
- Go to Railway dashboard → Backend → Deployments
- Copy the **Public Domain** URL (e.g., `https://arai-system-production.up.railway.app`)

### 4️⃣ Update Vercel with Railway Backend URL

In your Vercel project settings:
- Set environment variable: `REACT_APP_API_URL=YOUR-RAILWAY-URL/api/v1`

### 5️⃣ Deploy Frontend to Vercel

```bash
cd /Users/kavishani/Documents/FYP/arai-system/frontend
npm run build
vercel deploy --prod
```

## ✨ What Changed in Your Files

✅ `backend/app/core/config.py` - Made Supabase vars optional
✅ `frontend/.env.production` - Fixed to `https://arai-system-production.up.railway.app/api/v1`
✅ `frontend/.env.development` - Fixed to `http://localhost:8000/api/v1`
✅ `backend/.env.railway` - Created with all production variables

## 🧪 Test Locally First

```bash
# Terminal 1: Backend
cd backend
python -m uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend
npm start
```

The app should now run without crashes! 🚀
