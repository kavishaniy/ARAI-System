# ARAI Frontend - Vercel Deployment Guide

## ✅ Pre-Deployment Checklist (COMPLETED)

- ✅ Frontend build tested locally
- ✅ `.env.production` configured with backend URL: `https://arai-system.onrender.com/api/v1`
- ✅ `vercel.json` configuration created
- ✅ Changes committed and pushed to GitHub

---

## 🚀 Deploy on Vercel (Follow These Steps)

### Step 1: Create Vercel Account

1. Go to **https://vercel.com/**
2. Click **"Sign Up"**
3. Click **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account

---

### Step 2: Import Your Project

1. On Vercel Dashboard, click **"Add New..."** → **"Project"**
2. Under **"Import Git Repository"**:
   - You should see your GitHub repositories
   - Find **"ARAI-System"** (your repository name)
   - Click **"Import"**

**If you don't see your repo:**
- Click **"Adjust GitHub App Permissions"**
- Make sure Vercel can access your repository
- Go back and try importing again

---

### Step 3: Configure Project Settings

#### A. Framework Preset
```
Framework Preset: Create React App
```
(This should auto-detect, but verify!)

#### B. Root Directory ⚠️ IMPORTANT!
```
Root Directory: frontend
```
- Click **"Edit"** next to "Root Directory"
- Type: `frontend`
- This tells Vercel your React app is in the `frontend` folder

#### C. Build & Output Settings
These should auto-populate from your `vercel.json`:
```
Build Command: npm run build
Output Directory: build
Install Command: npm install
```

**Verify these are correct!**

---

### Step 4: Add Environment Variables

Click on **"Environment Variables"** section to expand it.

Add this variable:

**Variable 1:**
```
Name: REACT_APP_API_URL
Value: https://arai-system.onrender.com/api/v1
```

**Select environments for this variable:**
- ✅ Production
- ✅ Preview
- ✅ Development

⚠️ **CRITICAL**: Make sure this URL matches your deployed Render backend!

---

### Step 5: Deploy!

1. Review all settings one more time
2. Click the **"Deploy"** button at the bottom
3. Vercel will start building your project

**Build Process (1-3 minutes):**
```
⏳ Building...
📦 Installing dependencies...
🔨 Running build command...
🚀 Deploying...
✅ Success!
```

---

### Step 6: Get Your Frontend URL

After deployment succeeds, you'll see:
```
🎉 Congratulations! Your project is live!

Production Deployment:
https://arai-system.vercel.app
(or similar - Vercel will assign you a unique URL)
```

**Copy this URL!** You'll need it to test your application.

---

## 🧪 Testing Your Deployed Application

### Test 1: Basic Access
1. Open your Vercel URL in a browser
2. You should see the ARAI login/signup page
3. Check browser console (F12) - should be no errors

### Test 2: Sign Up Flow
1. Click **"Sign Up"**
2. Enter:
   - Email: `test@example.com`
   - Password: `Test123!@#`
   - Confirm Password: `Test123!@#`
3. Click **"Create Account"**
4. Should see success message or redirect to login

### Test 3: Login Flow
1. Use the credentials you just created
2. Click **"Login"**
3. Should redirect to Dashboard

### Test 4: Upload & Analysis
1. On Dashboard, click **"Upload Design"**
2. Select a UI design image (PNG/JPG)
3. Click **"Analyze"**
4. Wait for analysis to complete
5. Should see:
   - Heatmap visualization
   - Attention metrics
   - Design recommendations

### Test 5: History
1. Click **"History"** in navigation
2. Should see your previous analysis
3. Click on it to view results again

---

## 🔧 If Something Goes Wrong

### Build Fails
**Check:**
- Did you select `frontend` as root directory?
- Are build commands correct?
- Check Vercel build logs for specific errors

### App Loads but API Calls Fail
**Check:**
1. Environment variable is set correctly:
   ```
   REACT_APP_API_URL=https://arai-system.onrender.com/api/v1
   ```
2. Your Render backend is running (visit the URL)
3. Browser console for CORS errors
4. Network tab (F12) to see API responses

### CORS Errors
Your backend should already have CORS configured for Vercel domains.
If you see CORS errors, you may need to add your Vercel URL to backend CORS settings.

### 404 Errors on Refresh
This should NOT happen because of your `vercel.json` configuration.
If it does, verify `vercel.json` is in the `frontend` folder.

---

## 📝 Post-Deployment Checklist

After successful deployment, verify:

- [ ] Sign up works
- [ ] Login works
- [ ] Dashboard loads
- [ ] Image upload works
- [ ] Analysis generates results
- [ ] Heatmap displays correctly
- [ ] History shows previous analyses
- [ ] Logout works
- [ ] All navigation links work
- [ ] No console errors

---

## 🎯 Your Configuration Summary

**Backend (Render):**
- URL: `https://arai-system.onrender.com`
- API Base: `https://arai-system.onrender.com/api/v1`

**Frontend (Vercel):**
- Root Directory: `frontend`
- Environment: `REACT_APP_API_URL=https://arai-system.onrender.com/api/v1`
- Build Command: `npm run build`
- Output: `build`

---

## 🔗 Important URLs

- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repo**: https://github.com/kavishaniy/ARAI-System
- **Backend Health Check**: https://arai-system.onrender.com/health

---

## 🆘 Need Help?

Common issues:
1. **"Module not found" during build** → Missing dependency in `package.json`
2. **"API call failed"** → Check backend URL and CORS
3. **"Blank page"** → Check browser console for errors
4. **"502/503 errors"** → Backend might be sleeping (Render free tier)

---

## ✨ Success Criteria

Your deployment is successful when:
- ✅ Frontend loads at Vercel URL
- ✅ Users can sign up and login
- ✅ Images can be uploaded
- ✅ Analysis completes and shows results
- ✅ All features work end-to-end

---

**Ready to deploy? Follow the steps above! 🚀**

**Estimated Time: 10 minutes**
