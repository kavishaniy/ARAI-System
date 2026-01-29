# 🚀 QUICK START - Testing Auth Navigation

## Step 1: Open Browser Console
Press **F12** → Click **Console** tab → Keep it open!

## Step 2: Go to Login/Signup
- **Signup**: http://localhost:3000/signup
- **Login**: http://localhost:3000/login

## Step 3: Watch for Emojis! 🎯

### ✅ SUCCESS looks like this:
```
🚀 Starting signup...
📧 Email: user@example.com
✅ Signup response: {...}
✅ Token saved: eyJ...
🔄 About to navigate...
✅ Token verified...
🎯 Executing redirect
[Page reloads to Dashboard]
```

### ❌ FAILURE shows error:
```
🚀 Starting signup...
❌ Signup error: ...
❌ Error details: {...}
```

## Step 4: Quick Tests in Console

```javascript
// Check if logged in
localStorage.getItem('access_token')

// Manual redirect
window.location.href = '/dashboard'

// Start fresh
localStorage.clear(); location.reload()
```

## Common Issues:

| Problem | Fix |
|---------|-----|
| Network Error | Start backend: `cd backend && uvicorn app.main:app --reload` |
| 401 Error | Wrong password or user doesn't exist |
| 429 Error | Wait 5-10 minutes (rate limit) |
| No redirect | Look for ❌ errors in console |

---

**That's it!** The emojis tell you exactly what's happening. Follow the trail! 🎯

For detailed guide: See `CONSOLE_OUTPUT_GUIDE.md`
For troubleshooting: See `DASHBOARD_NAVIGATION_DEBUG.md`
