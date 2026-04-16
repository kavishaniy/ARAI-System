# 🚨 FIX: Projects Table Missing - Complete Solution

## Problem Identified

❌ **The `projects` table does NOT exist in your Supabase database**

This is why project creation is failing!

---

## ✅ Solution: Create the Table (2 Steps)

### Step 1: Get the SQL Script

The SQL script is already created for you:
- **File**: `CREATE_PROJECTS_TABLE.sql` (in project root)

### Step 2: Run SQL in Supabase

1. **Go to Supabase Dashboard**
   - URL: https://app.supabase.com
   - Login with your account

2. **Navigate to SQL Editor**
   - Left sidebar → SQL Editor
   - Click "+" or "New Query"

3. **Copy the SQL script**
   - Open: `CREATE_PROJECTS_TABLE.sql`
   - Copy all the SQL code

4. **Paste and Execute**
   - Paste into the SQL Editor
   - Click "Run" button
   - Should show: ✅ Success (no errors)

5. **Verify Table Created**
   - Go to Tables (left sidebar)
   - Look for "projects" table
   - Should show with columns: id, user_id, name, description, created_at, updated_at

---

## ❓ What This SQL Does

1. **Creates `projects` table** with:
   - `id` (UUID primary key)
   - `user_id` (links to auth.users)
   - `name` (project name)
   - `description` (optional description)
   - `created_at` (auto-generated timestamp)
   - `updated_at` (auto-generated timestamp)

2. **Creates index** on `user_id` for faster queries

3. **Enables Row Level Security (RLS)** so:
   - Users can ONLY see/edit/delete THEIR OWN projects
   - Other users cannot access another user's projects

---

## 🧪 Test After Creating Table

After creating the table, try this:

### 1. Test in Browser

1. Open http://localhost:3000
2. Sign in to your account
3. Go to Projects page
4. Click "New Project"
5. Enter:
   - Name: "Test Project"
   - Description: "Testing project creation"
6. Click "Create"
7. Should see project appear in list immediately ✅

### 2. Test in Postman (Optional)

```
POST http://localhost:8000/api/v1/projects

Headers:
- Authorization: Bearer <YOUR_TOKEN>
- Content-Type: application/json

Body:
{
  "name": "Test via Postman",
  "description": "Test description"
}
```

Expected response:
```json
{
  "id": "...",
  "user_id": "...",
  "name": "Test via Postman",
  "description": "Test description",
  "analysis_count": 0,
  "created_at": "2026-04-16T...",
  "updated_at": "2026-04-16T..."
}
```

### 3. Test via CLI

```bash
# Check backend logs for successful creation
tail -20 backend/backend.log

# Should show:
# ✅ Project created: <id> for user <user_id>
```

---

## 🔍 If Still Not Working

### Check 1: Is table created?

In Supabase → SQL Editor:
```sql
SELECT * FROM projects LIMIT 1;
```

Should return empty result (no error).

### Check 2: Is RLS enabled?

In Supabase → SQL Editor:
```sql
SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'projects';
```

Should show: `relrowsecurity: true`

### Check 3: Are you signed in?

- Check: Browser → DevTools (F12) → Application → localStorage
- Look for: `access_token` key
- Should have a long token string

### Check 4: Backend logs

```bash
cd /Users/kavishani/Documents/FYP/arai-system
tail -50 backend/backend.log | grep -E "(Project|Error|❌|✅)"
```

Should show successful creation logs.

---

## 📋 Checklist

Before declaring "fixed", verify:

- [ ] Supabase SQL executed without errors
- [ ] `projects` table appears in Supabase Tables section
- [ ] Table has 6 columns: id, user_id, name, description, created_at, updated_at
- [ ] Can create project via browser
- [ ] Project appears in list immediately
- [ ] Can view project details
- [ ] Backend logs show: "✅ Project created"

---

## 🆘 Still Stuck?

1. **Share these details**:
   - Error message from browser console (F12)
   - Response from POST request (Network tab)
   - Last 20 lines of backend logs

2. **Try nuclear option**:
   ```bash
   # Stop servers
   # Ctrl+C in both terminals
   
   # Delete projects table
   # Supabase → SQL Editor → DROP TABLE projects;
   
   # Recreate with script above
   
   # Restart backend
   cd /Users/kavishani/Documents/FYP/arai-system/backend
   python -m uvicorn app.main:app --reload
   
   # Restart frontend
   cd /Users/kavishani/Documents/FYP/arai-system/frontend
   npm start
   
   # Test again
   ```

---

## 📌 Summary

**The issue**: Missing database table
**The fix**: Run SQL script in Supabase
**Time to fix**: ~2 minutes
**Expected result**: Projects create and display immediately

Good luck! You're almost there. 🚀
