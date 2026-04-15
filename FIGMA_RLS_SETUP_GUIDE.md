# Step 3: Enable RLS (Row Level Security) - Detailed Guide

## What is RLS?

RLS (Row Level Security) ensures that users can only see and modify their own data. It's a critical security feature in Supabase.

---

## 📋 Complete RLS Setup Process

### Part 1: Enable RLS on All Tables

**Step 1: Go to Supabase Dashboard**
- Sign in to https://supabase.com
- Select your project
- Go to **SQL Editor** (left sidebar)

**Step 2: Run This SQL Command**

Copy and paste this entire block:

```sql
-- Enable RLS on all figma tables
ALTER TABLE figma_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE figma_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE figma_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE figma_frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE figma_analysis_results ENABLE ROW LEVEL SECURITY;
```

**Steps:**
1. Click **New Query**
2. Paste the code above
3. Click **Run** button (blue play icon)
4. You should see: `"ALTER TABLE ... SUCCESS"`

---

### Part 2: Create RLS Policies (Security Rules)

These policies define who can see/edit what data.

#### **Policy 1: figma_analyses table**

```sql
-- Policy 1: Users can view their own analyses
CREATE POLICY "Users can view own figma_analyses" ON figma_analyses
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy 2: Users can create analyses
CREATE POLICY "Users can create figma_analyses" ON figma_analyses
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own analyses
CREATE POLICY "Users can update own figma_analyses" ON figma_analyses
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can delete their own analyses
CREATE POLICY "Users can delete own figma_analyses" ON figma_analyses
  FOR DELETE 
  USING (auth.uid() = user_id);
```

**Steps:**
1. Click **New Query**
2. Paste code above
3. Click **Run**
4. Wait for success message

---

#### **Policy 2: figma_scores table**

```sql
-- Users can view scores for their own analyses
CREATE POLICY "Users can view own figma_scores" ON figma_scores
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM figma_analyses 
      WHERE figma_analyses.id = figma_scores.analysis_id 
      AND figma_analyses.user_id = auth.uid()
    )
  );

-- Users can insert scores for their own analyses
CREATE POLICY "Users can create figma_scores" ON figma_scores
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM figma_analyses 
      WHERE figma_analyses.id = figma_scores.analysis_id 
      AND figma_analyses.user_id = auth.uid()
    )
  );
```

**Steps:**
1. Click **New Query**
2. Paste code above
3. Click **Run**

---

#### **Policy 3: figma_pages table**

```sql
-- Users can view pages for their own analyses
CREATE POLICY "Users can view own figma_pages" ON figma_pages
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM figma_analyses 
      WHERE figma_analyses.id = figma_pages.analysis_id 
      AND figma_analyses.user_id = auth.uid()
    )
  );

-- Users can insert pages for their own analyses
CREATE POLICY "Users can create figma_pages" ON figma_pages
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM figma_analyses 
      WHERE figma_analyses.id = figma_pages.analysis_id 
      AND figma_analyses.user_id = auth.uid()
    )
  );
```

**Steps:**
1. Click **New Query**
2. Paste code above
3. Click **Run**

---

#### **Policy 4: figma_frames table**

```sql
-- Users can view frames for their own analyses
CREATE POLICY "Users can view own figma_frames" ON figma_frames
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM figma_analyses 
      WHERE figma_analyses.id = figma_frames.analysis_id 
      AND figma_analyses.user_id = auth.uid()
    )
  );

-- Users can insert frames for their own analyses
CREATE POLICY "Users can create figma_frames" ON figma_frames
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM figma_analyses 
      WHERE figma_analyses.id = figma_frames.analysis_id 
      AND figma_analyses.user_id = auth.uid()
    )
  );
```

**Steps:**
1. Click **New Query**
2. Paste code above
3. Click **Run**

---

#### **Policy 5: figma_analysis_results table**

```sql
-- Users can view results for their own analyses
CREATE POLICY "Users can view own figma_analysis_results" ON figma_analysis_results
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM figma_analyses 
      WHERE figma_analyses.id = figma_analysis_results.analysis_id 
      AND figma_analyses.user_id = auth.uid()
    )
  );

-- Users can insert results for their own analyses
CREATE POLICY "Users can create figma_analysis_results" ON figma_analysis_results
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM figma_analyses 
      WHERE figma_analyses.id = figma_analysis_results.analysis_id 
      AND figma_analyses.user_id = auth.uid()
    )
  );
```

**Steps:**
1. Click **New Query**
2. Paste code above
3. Click **Run**

---

## ✅ Verify RLS Setup

### Check 1: Verify RLS is Enabled

**Run this SQL:**
```sql
SELECT table_name, rowsecurity 
FROM pg_tables 
WHERE table_name LIKE 'figma_%' 
ORDER BY table_name;
```

**Expected result:**
```
table_name                  | rowsecurity
----------------------------|----------
figma_analyses              | t
figma_analysis_results      | t
figma_frames                | t
figma_pages                 | t
figma_scores                | t
```

All should show `t` (true)

---

### Check 2: Verify Policies Exist

**Run this SQL:**
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename LIKE 'figma_%' 
ORDER BY tablename;
```

**Expected result:**
```
tablename                | policyname
------------------------|-------------------------------------
figma_analyses           | Users can view own figma_analyses
figma_analyses           | Users can create figma_analyses
figma_analyses           | Users can update own figma_analyses
figma_analyses           | Users can delete own figma_analyses
figma_pages              | Users can view own figma_pages
figma_pages              | Users can create figma_pages
figma_frames             | Users can view own figma_frames
figma_frames             | Users can create figma_frames
figma_scores             | Users can view own figma_scores
figma_scores             | Users can create figma_scores
figma_analysis_results   | Users can view own figma_analysis_results
figma_analysis_results   | Users can create figma_analysis_results
```

You should see all policies listed.

---

## 🔐 Understanding RLS Policies

### What Each Policy Does

**SELECT (View) Policies:**
```sql
USING (auth.uid() = user_id)
```
- This checks: "Is the current logged-in user the owner of this row?"
- User can only see their own data

**INSERT (Create) Policies:**
```sql
WITH CHECK (auth.uid() = user_id)
```
- This checks: "Is the user trying to create data for themselves?"
- User can only insert data with their own user_id

**UPDATE (Modify) Policies:**
```sql
USING (...) WITH CHECK (...)
```
- USING: Can they see the row?
- WITH CHECK: Can they modify it?

**DELETE (Remove) Policies:**
```sql
USING (auth.uid() = user_id)
```
- User can only delete their own data

---

## 🔍 Test RLS is Working

### From Frontend (JavaScript/React)

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// After user logs in:
const user = await supabase.auth.getUser()
console.log('Logged in as:', user.user.id)

// Try to query - should only see own data
const { data, error } = await supabase
  .from('figma_analyses')
  .select('*')

if (error) {
  console.log('RLS Error (expected if no data):', error)
} else {
  console.log('User data:', data) // Should only show user's own analyses
}
```

### From Python Backend

```python
from supabase import create_client

supabase = create_client(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'  # Use anon key, not service role
)

# Get user token from login
response = supabase.auth.sign_in_with_password({
  'email': 'user@example.com',
  'password': 'password'
})

user_token = response.session.access_token

# Create authenticated client
auth_client = create_client(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY',
  supabase_key=user_token
)

# Query - RLS will filter to only user's data
data = auth_client.table('figma_analyses').select('*').execute()
print(data)
```

---

## ⚠️ Common RLS Issues & Solutions

### Issue 1: "ERROR: new row violates row-level security policy"

**Cause:** User_id doesn't match logged-in user

**Solution:**
```sql
-- Make sure you're setting user_id to current user
INSERT INTO figma_analyses (user_id, figma_file_id, ...)
VALUES (
  'YOUR_USER_ID_HERE',  -- Must match auth.uid()
  'file123',
  ...
)
```

### Issue 2: "Unable to fetch data"

**Cause:** Using wrong Supabase key or RLS policy too strict

**Solution:**
- Use **ANON KEY** for client-side (has RLS applied)
- Use **SERVICE ROLE KEY** for server-side (bypasses RLS)

### Issue 3: Can't see any data after enabling RLS

**Cause:** RLS is working! User just has no data yet.

**Solution:**
- Insert data with correct user_id
- Or use Service Role key temporarily to test

---

## 🛠️ Advanced: Service Role (For Backend)

**Why?**
- Backend needs to insert data without user being logged in
- Backend needs to run admin queries

**How to use:**
```python
from supabase import create_client

# Use SERVICE ROLE KEY (from Supabase project settings)
supabase_admin = create_client(
  'YOUR_SUPABASE_URL',
  'YOUR_SERVICE_ROLE_KEY'  # NOT anon key!
)

# This bypasses RLS - use with caution!
response = supabase_admin.table('figma_analyses').insert({
  'user_id': 'specific-user-id',
  'figma_file_id': 'file123',
  ...
}).execute()
```

⚠️ **WARNING:** Service Role key is sensitive! Store in `.env` file, never in frontend.

---

## 📝 RLS Setup Checklist

- [ ] All 5 tables have RLS enabled
- [ ] All policies created successfully
- [ ] Verified with `pg_policies` query
- [ ] Can view own data (SELECT)
- [ ] Can create own data (INSERT)
- [ ] Cannot see other users' data
- [ ] Service role key stored in backend `.env`

---

## 🎯 Complete SQL Setup (All at Once)

If you want to run everything at once:

```sql
-- PART 1: Enable RLS
ALTER TABLE figma_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE figma_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE figma_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE figma_frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE figma_analysis_results ENABLE ROW LEVEL SECURITY;

-- PART 2: Policies for figma_analyses
CREATE POLICY "Users can view own figma_analyses" ON figma_analyses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create figma_analyses" ON figma_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own figma_analyses" ON figma_analyses
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own figma_analyses" ON figma_analyses
  FOR DELETE USING (auth.uid() = user_id);

-- PART 3: Policies for figma_scores
CREATE POLICY "Users can view own figma_scores" ON figma_scores
  FOR SELECT USING (EXISTS (SELECT 1 FROM figma_analyses WHERE figma_analyses.id = figma_scores.analysis_id AND figma_analyses.user_id = auth.uid()));
CREATE POLICY "Users can create figma_scores" ON figma_scores
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM figma_analyses WHERE figma_analyses.id = figma_scores.analysis_id AND figma_analyses.user_id = auth.uid()));

-- PART 4: Policies for figma_pages
CREATE POLICY "Users can view own figma_pages" ON figma_pages
  FOR SELECT USING (EXISTS (SELECT 1 FROM figma_analyses WHERE figma_analyses.id = figma_pages.analysis_id AND figma_analyses.user_id = auth.uid()));
CREATE POLICY "Users can create figma_pages" ON figma_pages
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM figma_analyses WHERE figma_analyses.id = figma_pages.analysis_id AND figma_analyses.user_id = auth.uid()));

-- PART 5: Policies for figma_frames
CREATE POLICY "Users can view own figma_frames" ON figma_frames
  FOR SELECT USING (EXISTS (SELECT 1 FROM figma_analyses WHERE figma_analyses.id = figma_frames.analysis_id AND figma_analyses.user_id = auth.uid()));
CREATE POLICY "Users can create figma_frames" ON figma_frames
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM figma_analyses WHERE figma_analyses.id = figma_frames.analysis_id AND figma_analyses.user_id = auth.uid()));

-- PART 6: Policies for figma_analysis_results
CREATE POLICY "Users can view own figma_analysis_results" ON figma_analysis_results
  FOR SELECT USING (EXISTS (SELECT 1 FROM figma_analyses WHERE figma_analyses.id = figma_analysis_results.analysis_id AND figma_analyses.user_id = auth.uid()));
CREATE POLICY "Users can create figma_analysis_results" ON figma_analysis_results
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM figma_analyses WHERE figma_analyses.id = figma_analysis_results.analysis_id AND figma_analyses.user_id = auth.uid()));
```

---

## ✅ Next Steps After RLS Setup

1. ✅ RLS enabled on all tables
2. ✅ All policies created
3. ✅ Verified with test queries
4. ⬜ **Next:** Update backend to save data to Supabase
5. ⬜ **Next:** Update frontend to fetch from Supabase
6. ⬜ **Next:** Test end-to-end

---

## 📞 Need Help?

**Error?** Run verification checks:
```sql
SELECT table_name, rowsecurity FROM pg_tables WHERE table_name LIKE 'figma_%';
SELECT tablename, policyname FROM pg_policies WHERE tablename LIKE 'figma_%';
```

**Still stuck?** Check Supabase logs in Dashboard > Logs

---

**Status**: ✅ RLS Setup Guide Complete
**Date**: April 15, 2026
