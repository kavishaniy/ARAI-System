# Console Output Guide - What You Should See

## 🎯 How to Test

1. **Open Browser** → `http://localhost:3000/signup` (or `/login`)
2. **Open Developer Console** → Press `F12` → Click "Console" tab
3. **Fill in the form** and click "Sign up" or "Sign in"
4. **Watch the console** for the messages below

---

## ✅ SUCCESSFUL SIGNUP Flow

When signup works correctly, you'll see this exact sequence in the console:

```
🚀 Starting signup...
📧 Email: user@example.com
👤 Name: John Doe

✅ Signup response: {
  access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  token_type: "bearer",
  user: {
    id: "uuid-here",
    email: "user@example.com",
    full_name: "John Doe",
    avatar_url: null,
    created_at: "2026-01-28T..."
  }
}

✅ Token saved: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✅ User saved: {"id":"uuid","email":"user@example.com",...}
🔄 About to navigate to /dashboard...
✅ Token verified, redirecting in 100ms...
✅ Navigate setup complete!

[100ms pause]

🎯 Executing redirect to /dashboard

[Page reloads]

ProtectedRoute check: {
  isAuthenticated: true,
  hasToken: true,
  path: "/dashboard"
}
Authenticated, rendering protected content
```

**Result**: Dashboard page loads successfully! 🎉

---

## ✅ SUCCESSFUL LOGIN Flow

Similar to signup:

```
🚀 Starting login...
📧 Email: user@example.com

✅ Login response: {...}
✅ Token saved: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✅ User saved: {"id":"uuid","email":"user@example.com",...}
🔄 About to navigate to /dashboard...
✅ Token verified, redirecting in 100ms...
✅ Navigate setup complete!
🎯 Executing redirect to /dashboard

[Page reloads to dashboard]

ProtectedRoute check: {isAuthenticated: true, hasToken: true, path: "/dashboard"}
Authenticated, rendering protected content
```

**Result**: Dashboard page loads successfully! 🎉

---

## ❌ ERROR SCENARIOS

### Error 1: Backend Not Running

```
🚀 Starting signup...
📧 Email: user@example.com
👤 Name: John Doe

❌ Signup error: AxiosError: Network Error
❌ Error details: {
  message: "Network Error",
  response: undefined,
  status: undefined
}
```

**Fix**: Start backend with `cd backend && uvicorn app.main:app --reload`

---

### Error 2: Invalid Credentials (Login)

```
🚀 Starting login...
📧 Email: wrong@example.com

❌ Login error: AxiosError: Request failed with status code 401
❌ Error details: {
  message: "Request failed with status code 401",
  response: {detail: "Invalid credentials"},
  status: 401
}
```

**Fix**: Use correct email/password or create new account

---

### Error 3: Email Already Exists (Signup)

```
🚀 Starting signup...
📧 Email: existing@example.com
👤 Name: John Doe

❌ Signup error: AxiosError: Request failed with status code 400
❌ Error details: {
  message: "Request failed with status code 400",
  response: {detail: "This email is already registered"},
  status: 400
}
```

**Fix**: Use different email or login with existing account

---

### Error 4: Rate Limit Exceeded

```
🚀 Starting signup...
📧 Email: test@example.com
👤 Name: Test User

❌ Signup error: AxiosError: Request failed with status code 429
❌ Error details: {
  message: "Request failed with status code 429",
  response: {
    detail: "Email rate limit exceeded. Please wait a few minutes..."
  },
  status: 429
}
```

**Fix**: Wait 5-10 minutes or use different email

---

### Error 5: No Token Received

```
🚀 Starting signup...
📧 Email: user@example.com
👤 Name: John Doe

✅ Signup response: {token_type: "bearer", user: {...}}

✅ Token saved: null
✅ User saved: {"id":"uuid",...}
🔄 About to navigate to /dashboard...

❌ No token found in localStorage!

❌ Signup error: Error: Authentication token not received
❌ Error details: {
  message: "Authentication token not received",
  response: undefined,
  status: undefined
}
```

**Fix**: Backend issue - check backend logs and Supabase configuration

---

## 🔍 Manual Console Checks

If the automatic redirect doesn't work, try these commands in the browser console:

### 1. Check Authentication State
```javascript
// Check if token exists
localStorage.getItem('access_token')
// Should return: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// Check if user data exists
localStorage.getItem('user')
// Should return: "{\"id\":\"uuid\",\"email\":\"user@example.com\",...}"

// Check authentication status
!!localStorage.getItem('access_token')
// Should return: true
```

### 2. Manually Navigate to Dashboard
```javascript
// Try manual redirect
window.location.href = '/dashboard'
// Should redirect to dashboard if token exists
```

### 3. Clear Everything and Start Fresh
```javascript
// Clear all auth data
localStorage.clear()
sessionStorage.clear()

// Reload page
location.reload()
```

### 4. Inspect Stored Data
```javascript
// Pretty print the token (first 50 chars)
console.log('Token:', localStorage.getItem('access_token')?.substring(0, 50) + '...')

// Pretty print user data
console.log('User:', JSON.parse(localStorage.getItem('user')))
```

---

## 🎯 What Each Emoji Means

| Emoji | Meaning |
|-------|---------|
| 🚀 | Starting a process |
| 📧 | Email being used |
| 👤 | User name/data |
| ✅ | Success - something worked |
| ❌ | Error - something failed |
| 🔄 | Process starting |
| 🎯 | Action executing |

---

## 📊 Troubleshooting Decision Tree

```
Did you see "🚀 Starting signup/login..."?
│
├─ NO → JavaScript error before form submission
│        → Check for red errors in console
│        → Check if button is clickable
│
└─ YES → Form submission started
    │
    ├─ Did you see "✅ Signup/Login response"?
    │  │
    │  ├─ NO → Backend error
    │  │        → Check if backend is running
    │  │        → Check backend logs
    │  │        → Check network tab for failed request
    │  │
    │  └─ YES → Backend returned response
    │      │
    │      ├─ Did you see "✅ Token saved: eyJ..."?
    │      │  │
    │      │  ├─ NO → No access_token in response
    │      │  │        → Backend issue
    │      │  │        → Check backend auth.py
    │      │  │        → Check Supabase config
    │      │  │
    │      │  └─ YES → Token saved to localStorage
    │      │      │
    │      │      ├─ Did you see "🎯 Executing redirect"?
    │      │      │  │
    │      │      │  ├─ NO → setTimeout didn't execute
    │      │      │  │        → JavaScript error
    │      │      │  │        → Check for errors
    │      │      │  │
    │      │      │  └─ YES → Redirect executed
    │      │      │      │
    │      │      │      └─ Did page reload to /dashboard?
    │      │      │          │
    │      │      │          ├─ NO → Browser blocking redirect
    │      │      │          │        → Try incognito mode
    │      │      │          │        → Disable extensions
    │      │      │          │
    │      │      │          └─ YES → But redirects back to login?
    │      │      │                   → ProtectedRoute rejecting
    │      │      │                   → Check token validity
    │      │      │                   → Check ProtectedRoute logs
```

---

## 🎓 Understanding the Flow

### Normal Flow Timeline:
```
0ms    → User clicks "Sign up"
        → handleSubmit() called
        → 🚀 Starting signup...
        
100ms  → authService.signup() called
        → POST /api/v1/auth/signup
        
500ms  → Backend receives request
        → Creates user in Supabase
        → Returns {access_token, user}
        
600ms  → ✅ Signup response received
        → Token saved to localStorage
        → ✅ Token saved: ...
        → ✅ User saved: ...
        
601ms  → ✅ Token verified
        → setTimeout() scheduled for 100ms
        
701ms  → 🎯 Executing redirect
        → window.location.href = '/dashboard'
        
750ms  → Browser starts navigating
        → Page begins reloading
        
1000ms → New page loads
        → React app initializes
        → Routes evaluated
        → ProtectedRoute checks auth
        → ✅ Authenticated
        → Dashboard renders
```

---

## 💡 Pro Tips

1. **Keep Console Open**: Always have DevTools open when testing auth
2. **Clear Between Tests**: Run `localStorage.clear()` between test attempts
3. **Watch Network Tab**: Switch to Network tab to see HTTP requests/responses
4. **Use Incognito**: Test in incognito to avoid cached state
5. **Check Timing**: The 100ms delay is intentional - ensures localStorage write completes

---

## 🆘 Quick Reference

| Issue | What You'll See | Solution |
|-------|----------------|----------|
| Backend down | Network Error | Start backend |
| Wrong password | 401 error | Check credentials |
| Email exists | 400 error | Use different email |
| Rate limited | 429 error | Wait 5-10 minutes |
| No token | "No token found!" | Check backend/Supabase |
| Won't redirect | All ✅ but no redirect | Try manual redirect |
| Redirects back | Redirect works, then back to login | Token invalid |

---

**Remember**: The emoji trail in the console is your debugging breadcrumb! Follow it to see exactly where the flow stops.
