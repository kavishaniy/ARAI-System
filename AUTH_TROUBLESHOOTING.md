# 🔧 Authentication Troubleshooting Guide

## Problem: "Authentication failed" when uploading designs

### Quick Checklist

1. ✅ **Are you logged in?**
   - Open browser console (F12)
   - Type: `localStorage.getItem('access_token')`
   - Should return a long string (JWT token)
   - If `null`, you need to login again

2. ✅ **Check Backend Logs**
   - Look at the terminal running the backend
   - You should see authentication logs with emojis:
     - 🔑 Token received
     - ✅ Authenticated user
     - OR ❌ error messages

3. ✅ **Restart Backend**
   - The backend needs to reload the new authentication code
   - Press `Ctrl+C` in the backend terminal
   - Run: `cd backend && uvicorn app.main:app --reload`

---

## Step-by-Step Fix

### Step 1: Check if You're Logged In

Open browser console (F12 → Console) and run:

```javascript
// Check if token exists
console.log('Token:', localStorage.getItem('access_token'));
console.log('User:', localStorage.getItem('user'));
```

**If both are `null`:**
- Go to login page
- Login with your credentials
- Try uploading again

### Step 2: Restart the Backend

The authentication code was updated, so restart:

```bash
# In the terminal running the backend:
# 1. Press Ctrl+C to stop it
# 2. Then run:
cd /Users/kavishani/Documents/FYP/arai-system/backend
uvicorn app.main:app --reload
```

### Step 3: Test Upload Again

1. Go to http://localhost:3000
2. Make sure you're logged in (see your name/email in UI)
3. Go to "Upload Design" tab
4. Select a file
5. Click "Analyze Design"
6. Watch both:
   - Browser console (F12 → Console)
   - Backend terminal logs

### Step 4: Check Backend Logs

You should see these logs in the backend terminal:

```
📤 Upload request from user: <user_id>
💾 File saved locally: ...
🔍 Starting comprehensive analysis...
♿ Running comprehensive WCAG 2.1 analysis...
📖 Running readability analysis...
👁️ Running attention analysis...
💾 Analysis saved to database
✅ Analysis completed. ARAI Score: XX.XX
```

**If you see authentication errors:**
- Check the error message
- The token might be expired
- Try logging out and back in

---

## Common Errors & Solutions

### Error: "Authorization header missing"

**Problem:** Frontend isn't sending the token

**Solution:**
```javascript
// In browser console, check:
localStorage.getItem('access_token')

// If null, login again
```

### Error: "Invalid or expired token"

**Problem:** Token has expired (typically after 1 hour)

**Solution:**
1. Logout
2. Login again
3. Try upload again

### Error: "Token verification failed"

**Problem:** Supabase can't verify the token

**Solutions:**
1. Check `.env` file has correct `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
2. Restart backend
3. Try logging in again

### Error: "Module 'supabase' not found"

**Problem:** Python package not installed

**Solution:**
```bash
cd backend
pip install -r requirements.txt
```

---

## Debug Script

Run this to test your authentication:

```bash
python3 test_auth_debug.py
```

This will:
1. Test login with your credentials
2. Verify token works
3. Test database access
4. Show detailed debug info

---

## Manual Test in Browser Console

### 1. Check Authentication

```javascript
// Get token
const token = localStorage.getItem('access_token');
console.log('Token exists:', !!token);

// Get user
const user = JSON.parse(localStorage.getItem('user') || '{}');
console.log('User:', user);
```

### 2. Test API Call Manually

```javascript
// Test upload endpoint
const token = localStorage.getItem('access_token');

fetch('http://localhost:8000/api/v1/analysis/history', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(r => r.json())
.then(data => console.log('✅ Auth working! Data:', data))
.catch(err => console.error('❌ Auth failed:', err));
```

---

## If Nothing Works

### Nuclear Option: Fresh Start

```bash
# 1. Clear browser data
# In browser console:
localStorage.clear();

# 2. Restart backend
cd backend
# Press Ctrl+C
uvicorn app.main:app --reload

# 3. Restart frontend
cd frontend
# Press Ctrl+C
npm start

# 4. Login again
# Go to http://localhost:3000
# Click "Sign In"
# Enter credentials
# Try upload
```

---

## Expected Flow

### ✅ Correct Authentication Flow

1. **User logs in**
   - POST to `/api/v1/auth/login`
   - Receives JWT token
   - Token saved to `localStorage`

2. **User uploads design**
   - POST to `/api/v1/analysis/upload`
   - Sends `Authorization: Bearer <token>` header
   - Backend verifies token with Supabase
   - Backend extracts user ID from token
   - Analysis runs and saves to database

3. **User views history**
   - GET to `/api/v1/analysis/history`
   - Sends `Authorization: Bearer <token>` header
   - Backend fetches user's analyses only

---

## Debugging Tips

### Enable Verbose Logging

The backend now has detailed logging. Watch for these emojis:

- 📤 Upload request
- 🔑 Token received  
- ✅ Authenticated user
- 💾 File saved
- 🔍 Analysis starting
- ♿ WCAG analysis
- 📖 Readability analysis
- 👁️ Attention analysis
- ☁️ Uploaded to storage
- 💾 Saved to database
- ✅ Completed
- ❌ Error

### Check Both Consoles

**Browser Console (F12):**
- Request logs
- Response data
- JavaScript errors

**Backend Terminal:**
- Authentication logs
- Analysis progress
- Python errors

---

## Still Having Issues?

1. **Check all terminals are running:**
   - Backend: `uvicorn app.main:app --reload`
   - Frontend: `npm start`

2. **Verify Supabase credentials:**
   ```bash
   cd backend
   cat .env | grep SUPABASE
   ```

3. **Run the debug script:**
   ```bash
   python3 test_auth_debug.py
   ```

4. **Check backend logs carefully** - look for ❌ errors

5. **Share the error message** - exact error from backend logs

---

## Success Signs

You'll know it's working when you see:

✅ Browser console: `✅ Analysis completed: {...}`  
✅ Backend logs: `✅ Analysis completed. ARAI Score: XX.XX`  
✅ Results display in the UI  
✅ Analysis appears in History tab  
✅ Record appears in Supabase database  

---

**TL;DR:** 

1. Make sure you're logged in (check `localStorage.getItem('access_token')`)
2. Restart the backend (`Ctrl+C` then `uvicorn app.main:app --reload`)
3. Try upload again
4. Watch backend logs for detailed error messages

