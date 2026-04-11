# Railway Backend ↔ Vercel Frontend Connection Guide

## ✅ Current Setup Status

Your backend CORS is **already configured** for Vercel origins in `backend/app/main.py`:
- ✅ Whitelists specific Vercel domains
- ✅ Dynamically allows Vercel preview URLs (*.vercel.app)
- ✅ Handles preflight OPTIONS requests properly

## 📋 Steps to Complete the Connection

### Step 1: Deploy Backend to Railway
1. Push your backend code to your Git repository
2. Connect Railway to your GitHub repo
3. Deploy the backend service
4. **Copy your Railway public URL** (e.g., `https://arai-system-production.up.railway.app`)

### Step 2: Update Frontend Environment Variables

**Option A: Update `.env.production`**
```
REACT_APP_API_URL=https://YOUR_RAILWAY_BACKEND_URL/api/v1
```

Replace `YOUR_RAILWAY_BACKEND_URL` with your actual Railway URL.

**Option B: Set in Vercel Dashboard** (Recommended)
1. Go to https://vercel.com → Your Project → Settings
2. Navigate to **Environment Variables**
3. Add new variable:
   - Name: `REACT_APP_API_URL`
   - Value: `https://YOUR_RAILWAY_BACKEND_URL/api/v1`
   - Select: Production, Preview, Development

### Step 3: Deploy Frontend
1. Commit and push your changes to GitHub
2. Vercel will automatically rebuild with the new environment variable

### Step 4: Test the Connection
Once deployed, test your API endpoints:
```javascript
// In browser console, test the connection
fetch('https://YOUR_RAILWAY_BACKEND_URL/api/v1/health')
  .then(r => r.json())
  .then(console.log)
```

## 🔗 API Configuration

**Frontend (`api.js`):**
- Uses `REACT_APP_API_URL` environment variable
- Falls back to Render URL if not set: `https://arai-system.onrender.com/api/v1`
- Includes authentication token in request headers
- Has token expiration handling

**Backend (`main.py`):**
- CORS middleware accepts all `.vercel.app` domains
- Handles OPTIONS preflight requests
- Includes proper CORS headers: credentials, methods, headers

## 🚀 Quick Reference

| Component | URL Pattern |
|-----------|---|
| Railway Backend | `https://[project-name]-[environment].up.railway.app` |
| Vercel Frontend | `https://[project-name].vercel.app` |
| API Base | `https://[railway-url]/api/v1` |
| Health Check | `https://[railway-url]/api/v1/health` |

## ❌ Troubleshooting

**CORS errors?**
- Check that Railway backend is deployed
- Verify `REACT_APP_API_URL` is set correctly in Vercel
- Check backend logs for CORS middleware output

**401 Unauthorized?**
- Ensure authentication tokens are being set in headers
- Check token expiration logic in `frontend/src/services/api.js`

**Network timeouts?**
- Verify Railway service is running
- Check firewall/network settings
- Review Railway deployment logs
