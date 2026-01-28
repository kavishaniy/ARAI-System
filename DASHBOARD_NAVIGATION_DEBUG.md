# Dashboard Navigation Debugging Guide

## Issue
After successful login/signup, users are created in Supabase (visible in Authentication), but the application is not redirecting to the dashboard/next steps.

## ✅ Fixes Applied

### 1. **Enhanced Login Flow** (`frontend/src/components/Auth/Login.jsx`)
Added verification that the token is properly stored before redirecting:

```jsx
if (localStorage.getItem('access_token')) {
  console.log('Redirecting to dashboard...');
  setTimeout(() => {
    window.location.href = '/dashboard';
  }, 100);
} else {
  throw new Error('Authentication token not received');
}
```

### 2. **Enhanced Signup Flow** (`frontend/src/components/Auth/Signup.jsx`)
Same fix applied for consistency.

### 3. **Enhanced Protected Route** (`frontend/src/App.jsx`)
Added comprehensive logging to debug authentication state:

```jsx
console.log('ProtectedRoute check:', {
  isAuthenticated,
  hasToken: !!localStorage.getItem('access_token'),
  path: location.pathname
});
```

## 🔍 Debugging Steps

### Step 1: Open Browser Console
Open your browser's Developer Tools:
- **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- Navigate to the **Console** tab

### Step 2: Test Login Flow
1. Go to `http://localhost:3000/login`
2. Enter credentials and click "Sign in"
3. **Watch the console output** - You should see:

```
Login successful: {access_token: "...", token_type: "bearer", user: {...}}
Token stored: Yes
Redirecting to dashboard...
ProtectedRoute check: {isAuthenticated: true, hasToken: true, path: "/dashboard"}
Authenticated, rendering protected content
```

### Step 3: Test Signup Flow
1. Go to `http://localhost:3000/signup`
2. Fill in the form and click "Sign up"
3. **Watch the console output** - Similar to login flow

### Step 4: Manual Verification
If the redirect doesn't work, check these in the browser console:

```javascript
// Check if token is stored
localStorage.getItem('access_token')  // Should return a JWT token

// Check if user is stored
localStorage.getItem('user')  // Should return user JSON

// Check authentication state
window.location.href  // Should show current URL
```

## 🚨 Common Issues & Solutions

### Issue 1: "Token stored: No"
**Problem**: Backend didn't return an access token.

**Solution**:
- Check backend is running: `cd backend && uvicorn app.main:app --reload`
- Verify backend logs for errors
- Check Supabase configuration in `.env`

### Issue 2: Console shows redirect but page doesn't change
**Problem**: JavaScript error preventing redirect.

**Solution**:
- Look for red error messages in console
- Check if there are any React errors
- Try manually navigating: `window.location.href = '/dashboard'` in console

### Issue 3: Redirects to login immediately after redirect
**Problem**: Token is stored but `isAuthenticated()` returns false.

**Solution**:
```javascript
// In console, check:
!!localStorage.getItem('access_token')  // Should be true

// If false, the token might be invalid or expired
// Try logging in again
```

### Issue 4: Signup succeeds but stays on signup page
**Problem**: `window.location.href` not executing.

**Solution**:
- Check console for errors
- Verify the setTimeout is executing
- Try increasing timeout: `setTimeout(() => {...}, 500)`

## 🧪 Testing Checklist

### Backend Status
- [ ] Backend is running on `http://localhost:8000`
- [ ] Can access `http://localhost:8000` and see API info
- [ ] Environment variables are set in `backend/.env`
- [ ] Supabase credentials are correct

### Frontend Status
- [ ] Frontend is running on `http://localhost:3000`
- [ ] No errors in terminal where `npm start` is running
- [ ] Browser console is open (F12)

### Authentication Flow
- [ ] Login button is enabled (not disabled)
- [ ] Form submits without errors
- [ ] Console shows "Login successful"
- [ ] Console shows "Token stored: Yes"
- [ ] Console shows "Redirecting to dashboard..."
- [ ] Page redirects to `/dashboard`
- [ ] Console shows "Authenticated, rendering protected content"
- [ ] Dashboard page loads with content

### Navigation
- [ ] Navbar shows "Logout" button (not "Login"/"Sign Up")
- [ ] Can access `/dashboard` directly after login
- [ ] Accessing `/dashboard` without login redirects to `/login`
- [ ] Logout works and redirects to login

## 🔧 Manual Testing Commands

### Test Backend Auth Endpoint
```bash
# Test signup
curl -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test'$(date +%s)'@example.com",
    "password":"TestPassword123!",
    "full_name":"Test User"
  }'

# Test login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"TestPassword123!"
  }'
```

Expected response should include `access_token`.

### Test Frontend in Browser Console
```javascript
// After login, test these:

// 1. Check token exists
console.log('Token:', localStorage.getItem('access_token'));

// 2. Check user data
console.log('User:', localStorage.getItem('user'));

// 3. Test auth service
import { authService } from './services/auth';
console.log('Is Authenticated:', authService.isAuthenticated());

// 4. Manually redirect
window.location.href = '/dashboard';
```

## 📊 Expected Console Output Flow

### Successful Login Flow:
```
1. Login form submitted
2. Login successful: {access_token: "eyJ...", user: {...}}
3. Token stored: Yes
4. Redirecting to dashboard...
5. [Page reloads]
6. ProtectedRoute check: {isAuthenticated: true, hasToken: true, path: "/dashboard"}
7. Authenticated, rendering protected content
```

### Failed Login Flow:
```
1. Login form submitted
2. Login error: [error details]
3. [Error message displayed on screen]
4. [User remains on login page]
```

## 🎯 Next Steps Based on Console Output

### If you see "Token stored: No"
→ Backend issue. Check backend logs and Supabase connection.

### If you see "Token stored: Yes" but no redirect
→ JavaScript error. Check console for red error messages.

### If redirect happens but immediately goes back to login
→ Token validation issue. The token might be malformed or localStorage might be getting cleared.

### If everything logs correctly but nothing happens
→ Browser might be blocking the redirect. Try:
1. Disable browser extensions
2. Try incognito mode
3. Clear browser cache and localStorage

## 📝 Still Not Working?

If after following all steps the issue persists:

1. **Clear everything and restart:**
   ```bash
   # Stop both servers
   # Clear localStorage in browser console:
   localStorage.clear()
   
   # Restart backend
   cd backend
   uvicorn app.main:app --reload
   
   # Restart frontend (in new terminal)
   cd frontend
   npm start
   ```

2. **Check for specific errors:**
   - Take a screenshot of the console output
   - Check the Network tab (F12 → Network) for failed requests
   - Look for any red text in the terminal where npm/uvicorn is running

3. **Verify Supabase:**
   - Go to Supabase Dashboard
   - Check Authentication → Users
   - Verify the user was created
   - Check if email confirmation is required

## 🎓 Understanding the Flow

```
User enters credentials
       ↓
Click Login/Signup
       ↓
authService.login() called
       ↓
POST to /api/v1/auth/login
       ↓
Backend authenticates with Supabase
       ↓
Backend returns {access_token, user}
       ↓
Token saved to localStorage
       ↓
window.location.href = '/dashboard'
       ↓
Page reloads
       ↓
React app initializes
       ↓
Routes evaluated
       ↓
/dashboard route → ProtectedRoute
       ↓
ProtectedRoute checks isAuthenticated()
       ↓
isAuthenticated() reads localStorage
       ↓
Token exists → return true
       ↓
Dashboard component renders
```

## 💡 Pro Tips

1. **Keep console open**: Always have browser console open when testing auth flows
2. **Use unique emails**: For testing signup, use unique emails like `test1@example.com`, `test2@example.com`
3. **Check Network tab**: The Network tab shows all HTTP requests and their responses
4. **Supabase dashboard**: Keep Supabase dashboard open to verify users are being created

## 🆘 Emergency Fix

If nothing works, try this complete reset:

```javascript
// In browser console:
localStorage.clear();
sessionStorage.clear();
location.reload();

// Then login again with a known working account
```

---

**Remember**: The console output is your friend! It will tell you exactly where the flow is breaking.
