# 🚨 CRITICAL: Set Railway Environment Variable

## The Problem
Your backend is rejecting requests from your frontend because the `ALLOWED_ORIGINS` 
environment variable is NOT SET in Railway.

## ✅ SOLUTION - Follow These Exact Steps:

### Step 1: Open Railway Dashboard
**URL:** https://railway.com/project/2dee3236-8f3c-4a8c-a7d0-1843e49cf69f

### Step 2: Select Your Service
- You should see a service called **"arai-system"**
- **CLICK** on it

### Step 3: Go to Variables Tab
- At the top of the page, you'll see tabs: Overview, Deployments, Metrics, **Variables**, Settings
- **CLICK** on **"Variables"**

### Step 4: Add the Environment Variable
Look at the Variables page. You should see existing variables like:
- SUPABASE_URL
- SUPABASE_KEY
- SECRET_KEY
- etc.

**Now ADD a new variable:**

1. Look for a button that says **"+ New Variable"** or **"Add Variable"**
2. **CLICK** it
3. You'll see two input fields:

   ```
   Variable Name:  [_______________]
   Variable Value: [_______________]
   ```

4. **TYPE EXACTLY:**
   - Variable Name: `ALLOWED_ORIGINS`
   - Variable Value: `https://frontend-seven-alpha-91.vercel.app`

5. **CLICK** "Add" or "Save" button

### Step 5: Wait for Automatic Redeploy
- Railway will automatically start a new deployment
- You'll see it in the "Deployments" tab
- **WAIT** until it shows "Success" or "Ready" (usually 30-60 seconds)
- You'll see build logs scrolling

### Step 6: Test Again
Run this command in your terminal:

```bash
./test-cors.sh
```

**You should now see:**
```
HTTP/2 200
access-control-allow-origin: https://frontend-seven-alpha-91.vercel.app
```

### Step 7: Try Your Frontend
Go to: https://frontend-seven-alpha-91.vercel.app

Try to sign up - it should work now! 🎉

---

## 🔍 Troubleshooting

**If you still see HTTP/2 400 after setting the variable:**
1. Check the spelling: It must be EXACTLY `ALLOWED_ORIGINS` (with an S at the end)
2. Check the value: It must be EXACTLY `https://frontend-seven-alpha-91.vercel.app`
3. Make sure Railway finished redeploying (check Deployments tab)
4. Try clicking "Redeploy" on the latest deployment if it's not picking up the variable

**If you can't find the Variables tab:**
1. Make sure you're logged into Railway
2. Make sure you clicked ON the "arai-system" service (not just viewing the project)
3. The tabs should be at the top: Overview | Deployments | Metrics | Variables | Settings

---

## 📸 What to Look For

When viewing Variables, you should see something like:

```
Variables (Production)

SUPABASE_URL                 https://omguovoobfiuaooupzsw.supabase.co
SUPABASE_KEY                 eyJhbGci...
SECRET_KEY                   sb_secret_...
ALLOWED_ORIGINS              https://frontend-seven-alpha-91.vercel.app  👈 ADD THIS!

[+ New Variable]
```

---

## ⚠️ IMPORTANT NOTE

The Railway CLI is timing out due to network issues. You MUST use the web dashboard.
There is no other way to set this variable right now.
