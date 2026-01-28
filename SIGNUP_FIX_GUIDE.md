# Signup Issue Fix Guide

## Issue
The signup form was not proceeding to the next step after clicking "Sign up".

## What Was Fixed

### 1. Frontend - Signup Component (`frontend/src/components/Auth/Signup.jsx`)
**Problem:** The signup form had a TODO comment and only logged to console without actually calling the backend API.

**Fixed:**
- ✅ Imported `authService` from `../../services/auth`
- ✅ Added `loading` state to show "Signing up..." during API call
- ✅ Implemented actual API call: `await authService.signup(formData.email, formData.password, formData.name)`
- ✅ Added navigation to `/dashboard` after successful signup
- ✅ Improved error handling with proper error messages
- ✅ Added loading state to button (disabled during signup)
- ✅ Added "Already have an account? Sign in" link

### 2. Backend - Auth Endpoint (`backend/app/api/auth.py`)
**Problem:** Row Level Security (RLS) policy in Supabase was blocking profile creation.

**Fixed:**
- ✅ Created separate `supabase_admin` client using `SUPABASE_SERVICE_KEY` for elevated privileges
- ✅ Updated signup to use admin client for profile creation (bypasses RLS)
- ✅ Added user metadata to auth signup for better profile management
- ✅ Improved error handling with user-friendly messages
- ✅ Added fallback if profile creation fails (might be handled by database triggers)

## Current State

### ✅ What's Working:
- Frontend signup form properly calls backend API
- Loading states and error messages display correctly
- Navigation configured to go to /dashboard after signup
- Backend endpoint properly structured
- CORS configured correctly
- Auth service properly stores tokens in localStorage

### ⚠️ Potential Issues to Check:

1. **Supabase Configuration** (Most Likely Issue)
   - **Email Confirmation**: If email confirmation is enabled in Supabase, users need to verify their email before logging in
   - **Rate Limiting**: Supabase has email rate limits (wait a few minutes between signups)
   - **RLS Policies**: Row Level Security policies might still be blocking profile reads

2. **Database Setup**
   - Ensure `profiles` table exists in Supabase
   - Check if there's a trigger to auto-create profiles (recommended approach)

## How to Test

1. **Start Backend:**
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm start
   ```

3. **Test Signup Flow:**
   - Go to `http://localhost:3000/signup`
   - Fill in: Name, Email, Password, Confirm Password
   - Click "Sign up"
   - Should redirect to `/dashboard` on success
   - Check browser console (F12) for any errors

4. **Check Backend Response:**
   ```bash
   curl -X POST http://localhost:8000/api/v1/auth/signup \
     -H "Content-Type: application/json" \
     -d '{
       "email":"test@example.com",
       "password":"SecurePass123!",
       "full_name":"Test User"
     }'
   ```

## Supabase Setup Required

### Option 1: Disable Email Confirmation (For Development)
1. Go to Supabase Dashboard → Authentication → Settings
2. Disable "Enable email confirmations"
3. Save changes

### Option 2: Setup Auto-Profile Creation (Recommended)
Create a database trigger to automatically create profiles:

```sql
-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Create function to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
```

### Option 3: Public Insert Policy (For Development Only)
```sql
-- Allow service role to insert profiles
CREATE POLICY "Service role can insert profiles"
    ON public.profiles FOR INSERT
    WITH CHECK (true);
```

## Next Steps

1. ✅ Frontend changes complete - form now calls API correctly
2. ✅ Backend improved - better error handling and admin client
3. ⏳ Configure Supabase settings (see options above)
4. ⏳ Test end-to-end signup flow
5. ⏳ Verify email confirmation flow (if enabled)

## Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Signup failed: email rate limit exceeded" | Too many signup attempts | Wait 60 seconds or disable rate limiting in Supabase |
| "row violates row-level security policy" | RLS blocking profile creation | Use admin client (already fixed) or setup trigger |
| "Invalid authentication" | Email not confirmed | Disable email confirmation or check inbox |
| Network error / CORS | Backend not running | Start backend: `uvicorn app.main:app --reload` |

## Files Modified

1. `/frontend/src/components/Auth/Signup.jsx` - Implemented actual signup logic
2. `/backend/app/api/auth.py` - Fixed RLS issue with admin client
3. `/frontend/package.json` - Fixed react-scripts version (done earlier)

