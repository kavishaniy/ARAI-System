# Railway Deployment Guide

## ✅ Completed Steps

### 1. Railway CLI Installation & Login
```bash
npm install -g @railway/cli
railway login --browserless
```
✅ Successfully logged in as kavishani.pat@gmail.com

### 2. Project Files Created
- ✅ `Procfile` - Defines how to run the application
- ✅ `requirements.txt` - Updated with all dependencies including PyTorch CPU
- ✅ `runtime.txt` - Specifies Python 3.11.7

### 3. Railway Project Initialized
- ✅ Project created: `arai-system`
- ✅ Project URL: https://railway.com/project/2dee3236-8f3c-4a8c-a7d0-1843e49cf69f

### 4. Initial Deployment
- ✅ Build succeeded
- ✅ All packages installed successfully
- ⚠️ Deployment crashed due to missing environment variables

## 🔧 Next Steps Required

### Set Environment Variables

You have two options:

#### Option 1: Using Railway CLI (Recommended)
```bash
cd /Users/kavishani/Documents/FYP/arai-system/backend

# Set Supabase credentials (replace with your actual values)
railway variables set SUPABASE_URL='your-supabase-project-url'
railway variables set SUPABASE_KEY='your-supabase-anon-key'
railway variables set SUPABASE_SERVICE_KEY='your-supabase-service-role-key'

# Set security and environment settings
railway variables set SECRET_KEY='$(openssl rand -hex 32)'
railway variables set DEBUG='False'
railway variables set ENVIRONMENT='production'

# Optional: Set CORS origins (update with your frontend URL once deployed)
railway variables set ALLOWED_ORIGINS='https://your-frontend-url.com'

# Redeploy after setting variables
railway up
```

#### Option 2: Using Railway Dashboard
1. Go to: https://railway.com/project/2dee3236-8f3c-4a8c-a7d0-1843e49cf69f
2. Click on your service (`arai-system`)
3. Click on the **Variables** tab
4. Add each variable:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `SUPABASE_SERVICE_KEY`
   - `SECRET_KEY` (generate with: `openssl rand -hex 32`)
   - `DEBUG` = `False`
   - `ENVIRONMENT` = `production`
   - `ALLOWED_ORIGINS` (your frontend URL)

### Where to Find Supabase Credentials

1. Go to your Supabase project: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
2. Click on **Settings** (gear icon)
3. Click on **API**
4. You'll find:
   - **URL** → Use for `SUPABASE_URL`
   - **anon/public key** → Use for `SUPABASE_KEY`
   - **service_role key** → Use for `SUPABASE_SERVICE_KEY` (⚠️ Keep secret!)

## 📦 Deployment Configuration

### Procfile
```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Runtime
- Python 3.11.7
- PyTorch CPU-only (optimized for smaller deployment size)

### Key Dependencies
- FastAPI 0.104.1
- Uvicorn 0.24.0
- PyTorch 2.1.0+cpu (~185MB instead of 2GB)
- TorchVision 0.16.0+cpu
- OpenCV Headless 4.8.1.78
- Supabase 2.0.3
- And more...

## 🚀 Deploy Again

After setting environment variables:

```bash
cd /Users/kavishani/Documents/FYP/arai-system/backend
railway up
```

## 📝 Important Notes

1. **AI Model Files**: The application references model files in `ai_models/` directory. Make sure these are:
   - Committed to your repository, OR
   - Uploaded to cloud storage and referenced via URLs

2. **File Uploads**: The `uploads/` directory won't persist on Railway. Consider using:
   - Supabase Storage
   - AWS S3
   - Cloudinary

3. **Domain Setup**: After successful deployment, Railway will provide a URL like:
   - `https://arai-system-production.up.railway.app`

4. **Update CORS**: Once you have your production URLs, update `ALLOWED_ORIGINS` to include them.

## 🔍 Monitoring

- **View Logs**: `railway logs`
- **View Deployments**: https://railway.com/project/2dee3236-8f3c-4a8c-a7d0-1843e49cf69f
- **Service Status**: Check the Railway dashboard

## ❓ Troubleshooting

If deployment still fails:
1. Check logs: `railway logs`
2. Verify all environment variables are set
3. Ensure AI model files are accessible
4. Check that PORT is not hardcoded (Railway uses $PORT)
