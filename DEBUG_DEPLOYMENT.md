# 🐛 Debugging Network Error on Frontend

## Problem: Network Error when clicking "Analyze Design"

### Most Likely Causes:

#### 1. ❌ **Wrong Backend URL in Environment Variables**
Your `.env.production` has placeholder: `https://arai-backend.onrender.com/api/v1`

**Fix in Vercel:**
1. Go to https://vercel.com/dashboard
2. Click on your project
3. Go to **Settings** → **Environment Variables**
4. Find `REACT_APP_API_URL`
5. Change to YOUR actual Render URL: `https://YOUR-ACTUAL-APP.onrender.com/api/v1`
6. Click **Save**
7. Go to **Deployments** tab
8. Click **⋯** (three dots) on latest deployment
9. Click **Redeploy** → **Redeploy**

#### 2. ❌ **CORS Not Configured for Vercel Domain**

**Fix in Render:**
1. Go to https://dashboard.render.com
2. Click on your backend service
3. Go to **Environment** tab
4. Add/Update environment variable:
   ```
   Name: ALLOWED_ORIGINS
   Value: https://YOUR-APP.vercel.app,https://*.vercel.app
   ```
5. Click **Save Changes**
6. Your app will auto-redeploy

#### 3. ❌ **Backend Not Running or Sleeping**

Render free tier sleeps after 15 minutes of inactivity.

**Check:**
1. Open: `https://YOUR-BACKEND.onrender.com/health`
2. Should return: `{"status": "healthy"}`
3. If it takes 30-60 seconds to load, it was sleeping (normal for free tier)

---

## 🔍 Quick Diagnosis Steps:

### Step 1: Find Your Actual URLs

**Backend URL (Render):**
1. Go to https://dashboard.render.com
2. Your service should show the URL like: `https://arai-backend-xxxx.onrender.com`

**Frontend URL (Vercel):**
1. Go to https://vercel.com/dashboard
2. Your project should show the URL like: `https://arai-system.vercel.app`

### Step 2: Test Backend Health

Open in browser:
```
https://YOUR-BACKEND-URL.onrender.com/health
```

Expected response:
```json
{"status": "healthy"}
```

### Step 3: Check CORS Configuration

Open in browser:
```
https://YOUR-BACKEND-URL.onrender.com/debug/cors
```

Should show your allowed origins including your Vercel URL.

### Step 4: Check Frontend Console

In your Vercel deployed site:
1. Press **F12** (open DevTools)
2. Go to **Console** tab
3. Try uploading and analyzing an image
4. Look for errors like:
   - `CORS policy: No 'Access-Control-Allow-Origin'` → CORS issue
   - `Failed to fetch` → Wrong URL or backend down
   - `404 Not Found` → Wrong endpoint
   - `401 Unauthorized` → Auth token issue

---

## ✅ Complete Fix Checklist:

### On Vercel (Frontend):
- [ ] Set `REACT_APP_API_URL` to correct Render URL
- [ ] Redeploy after changing env variable
- [ ] Test in browser (clear cache: Cmd+Shift+R)

### On Render (Backend):
- [ ] Set `ALLOWED_ORIGINS` to include Vercel URL
- [ ] Verify `ENVIRONMENT=production` is set
- [ ] Check logs for errors (Dashboard → Logs)
- [ ] Test `/health` endpoint

### Local Testing (Optional):
```bash
# Test your deployed backend from terminal
curl https://YOUR-BACKEND.onrender.com/health

# Should return: {"status":"healthy"}
```

---

## 🚨 Common Mistakes:

1. ❌ Forgot to redeploy after changing env variables
2. ❌ Used `http://` instead of `https://`
3. ❌ Included `/api/v1` twice in the URL
4. ❌ Typo in the backend URL
5. ❌ Backend is sleeping (wait 30-60 seconds)
6. ❌ Wildcard CORS pattern not working (use specific URL)

---

## 📋 What URLs Should Look Like:

### ✅ Correct Environment Variables:

**Vercel (Frontend):**
```
REACT_APP_API_URL=https://arai-backend-xxxx.onrender.com/api/v1
```

**Render (Backend):**
```
ALLOWED_ORIGINS=https://arai-system.vercel.app,https://arai-system-git-main.vercel.app
ENVIRONMENT=production
```

### ✅ API Call Example:
When frontend calls: `api.post('/analysis/upload', ...)`

Full URL becomes: `https://arai-backend-xxxx.onrender.com/api/v1/analysis/upload`

---

## 🆘 Still Not Working?

Run these checks and share the output:

1. **What's your Vercel frontend URL?**
   ```
   Example: https://arai-system.vercel.app
   ```

2. **What's your Render backend URL?**
   ```
   Example: https://arai-backend-xxxx.onrender.com
   ```

3. **What error shows in browser console? (F12)**
   ```
   Copy the exact error message
   ```

4. **Does `/health` work?**
   ```
   Open: https://YOUR-BACKEND.onrender.com/health
   ```
