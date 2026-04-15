# Fix Duplicate RLS Policies Error

## Problem
You're getting this error:
```
ERROR: 42710: policy "Users can view own figma_analyses" for table "figma_analyses" already exists
```

This means the policies were already created (partially or fully). **Don't panic!** - This is fixable.

---

## ✅ Solution: Check What Exists & Continue

### Step 1: See What Policies Already Exist

Run this in Supabase SQL Editor:

```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename LIKE 'figma_%' 
ORDER BY tablename;
```

This will show you which policies are already created.

---

### Step 2: Drop Old Policies (Optional - Only if you want to recreate)

**⚠️ CAUTION:** Only do this if you want to delete and recreate all policies.

```sql
-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own figma_analyses" ON figma_analyses;
DROP POLICY IF EXISTS "Users can create figma_analyses" ON figma_analyses;
DROP POLICY IF EXISTS "Users can update own figma_analyses" ON figma_analyses;
DROP POLICY IF EXISTS "Users can delete own figma_analyses" ON figma_analyses;

DROP POLICY IF EXISTS "Users can view own figma_scores" ON figma_scores;
DROP POLICY IF EXISTS "Users can create figma_scores" ON figma_scores;

DROP POLICY IF EXISTS "Users can view own figma_pages" ON figma_pages;
DROP POLICY IF EXISTS "Users can create figma_pages" ON figma_pages;

DROP POLICY IF EXISTS "Users can view own figma_frames" ON figma_frames;
DROP POLICY IF EXISTS "Users can create figma_frames" ON figma_frames;

DROP POLICY IF EXISTS "Users can view own figma_analysis_results" ON figma_analysis_results;
DROP POLICY IF EXISTS "Users can create figma_analysis_results" ON figma_analysis_results;
```

After running the DROP commands, you can safely run the CREATE POLICY commands again.

---

### Step 3: Create Missing Policies Only

Check which policies are missing from the list in Step 1, then run only those CREATE POLICY commands.

**Example:** If you already have policies for `figma_analyses`, skip those and run only the policies for other tables.

---

## ✅ Simpler Approach: Skip Duplicates

If the policies exist and work correctly, **you can skip re-creating them!**

### Verify Policies Are Complete

Run this to see if you have all 12 policies:

```sql
SELECT COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename LIKE 'figma_%';
```

**Expected result:** `12` (4 for figma_analyses, 2 each for the other 4 tables)

If you see 12, you're done! ✅

---

## 📋 Quick Reference: Which Policies You Need

### figma_analyses (4 policies)
- [x] "Users can view own figma_analyses"
- [x] "Users can create figma_analyses"
- [x] "Users can update own figma_analyses"
- [x] "Users can delete own figma_analyses"

### figma_scores (2 policies)
- "Users can view own figma_scores"
- "Users can create figma_scores"

### figma_pages (2 policies)
- "Users can view own figma_pages"
- "Users can create figma_pages"

### figma_frames (2 policies)
- "Users can view own figma_frames"
- "Users can create figma_frames"

### figma_analysis_results (2 policies)
- "Users can view own figma_analysis_results"
- "Users can create figma_analysis_results"

---

## 🔧 If You Only Have Some Policies

**Example: You have figma_analyses policies but missing others**

Run only the missing ones:

```sql
-- Policy 2: figma_scores (if missing)
CREATE POLICY "Users can view own figma_scores" ON figma_scores
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM figma_analyses 
      WHERE figma_analyses.id = figma_scores.analysis_id 
      AND figma_analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create figma_scores" ON figma_scores
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM figma_analyses 
      WHERE figma_analyses.id = figma_scores.analysis_id 
      AND figma_analyses.user_id = auth.uid()
    )
  );

-- Policy 3: figma_pages (if missing)
CREATE POLICY "Users can view own figma_pages" ON figma_pages
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM figma_analyses 
      WHERE figma_analyses.id = figma_pages.analysis_id 
      AND figma_analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create figma_pages" ON figma_pages
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM figma_analyses 
      WHERE figma_analyses.id = figma_pages.analysis_id 
      AND figma_analyses.user_id = auth.uid()
    )
  );

-- Policy 4: figma_frames (if missing)
CREATE POLICY "Users can view own figma_frames" ON figma_frames
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM figma_analyses 
      WHERE figma_analyses.id = figma_frames.analysis_id 
      AND figma_analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create figma_frames" ON figma_frames
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM figma_analyses 
      WHERE figma_analyses.id = figma_frames.analysis_id 
      AND figma_analyses.user_id = auth.uid()
    )
  );

-- Policy 5: figma_analysis_results (if missing)
CREATE POLICY "Users can view own figma_analysis_results" ON figma_analysis_results
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM figma_analyses 
      WHERE figma_analyses.id = figma_analysis_results.analysis_id 
      AND figma_analyses.user_id = auth.uid()
    )
  );

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

---

## ✅ Final Verification

After all policies are created, run:

```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename LIKE 'figma_%' 
ORDER BY tablename;
```

You should see exactly **12 policies** listed:
- 4 for figma_analyses
- 2 for figma_scores
- 2 for figma_pages
- 2 for figma_frames
- 2 for figma_analysis_results

---

## 🎯 Done!

Once you have all 12 policies created, **Step 3 (RLS) is complete** ✅

**Next Step:** Update backend to connect to Supabase and save data to these tables.

---

## 📞 Still Having Issues?

**All policies exist but still getting error?**
- Try refreshing the Supabase page
- Clear browser cache
- Try again

**Not sure which policies are missing?**
- Run the COUNT query to see total
- Run the SELECT query to see names
- Compare against the 12 expected policies

**Want a fresh start?**
- Drop all policies (see Step 2 above)
- Run all CREATE POLICY commands fresh

---

**Status**: ✅ Duplicate Policy Fix Guide Complete
**Date**: April 15, 2026
