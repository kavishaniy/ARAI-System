# 🚨 IF AUTOMATIC FIX DOESN'T WORK - MANUAL SOLUTION

If after 5 minutes the deployment still has localhost, follow these steps:

---

## ✅ **MANUAL FIX - Vercel Dashboard Method**

### Step 1: Go to Vercel Dashboard
1. Open: https://vercel.com/dashboard
2. Click on your **arai-system** project
3. Click **"Settings"** tab (top menu)

### Step 2: Set Environment Variable
1. Click **"Environment Variables"** in left sidebar
2. Look for `REACT_APP_API_URL`

**If it EXISTS:**
   - Click the **⋯** menu next to it
   - Click **"Edit"**
   - Change value to: `https://arai-system.onrender.com/api/v1`
   - ✅ Check ALL 3 boxes:
     - [x] Production
     - [x] Preview  
     - [x] Development
   - Click **"Save"**

**If it DOESN'T EXIST:**
   - Click **"Add New"** button (top right)
   - Name: `REACT_APP_API_URL`
   - Value: `https://arai-system.onrender.com/api/v1`
   - ✅ Check ALL 3 boxes:
     - [x] Production
     - [x] Preview
     - [x] Development
   - Click **"Save"**

### Step 3: Redeploy
1. Click **"Deployments"** tab (top menu)
2. Find the **latest deployment** (top of the list)
3. Click the **⋯** menu on the right side
4. Click **"Redeploy"**
5. A popup appears - click **"Redeploy"** again to confirm
6. Wait 2-3 minutes for "Ready" status

### Step 4: Verify
Run this command:
```bash
./verify-vercel-fix.sh
```

Expected output:
```
✅ NO localhost found - GOOD!
✅ HAS production URL - GOOD!
✅ ALL FIXED!
```

### Step 5: Test in Browser
1. Open **Incognito/Private window**
2. Go to: https://arai-system.vercel.app
3. Press **Cmd + Shift + R** (hard refresh)
4. Sign in
5. Try upload/analysis

---

## 🔧 **ALTERNATIVE: Build Locally and Deploy**

If Vercel dashboard method also doesn't work, build locally:

```bash
cd frontend

# Set environment variable
export REACT_APP_API_URL=https://arai-system.onrender.com/api/v1

# Build
npm run build

# Deploy to Vercel
npx vercel --prod
```

This will build with the correct URL and deploy directly.

---

## 🐛 **Why This Is Happening**

Vercel's environment variable system has issues with Create React App when:
1. Variables are set after initial deployment
2. Framework preset isn't detecting them properly
3. Build cache is being reused

The manual redeploy forces a fresh build with the environment variable.

---

## 📞 **Get Help**

If none of these work, share:
1. Screenshot of Vercel Environment Variables page
2. Screenshot of latest deployment logs (click on deployment → "View Logs")
3. Output of: `./verify-vercel-fix.sh`

We'll debug from there! 🚀
