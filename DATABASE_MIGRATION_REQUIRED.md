# 🚨 CRITICAL: Database Migration Required

## Problem Found
The analyses table is missing the `project_id` column needed to link analyses to projects. This is why analyzed images don't persist in the project history after you refresh or navigate away.

## Solution

### Step 1: Open Supabase SQL Editor
1. Go to: https://app.supabase.com/project/_/sql/new (replace _ with your project ID)
2. Or navigate to your Supabase dashboard → SQL Editor → New Query

### Step 2: Copy and Run the Migration SQL
Copy the entire content from `RUN_THIS_SQL_IN_SUPABASE.sql` and paste it into the Supabase SQL editor.

The SQL will:
- ✅ Add the `project_id` column to the analyses table
- ✅ Create indexes for fast lookups
- ✅ Set up auto-update triggers for project timestamps
- ✅ Handle cascading deletes (deleting a project deletes its analyses)

### Step 3: Execute
Click the "Run" button or press Ctrl+Enter

### Step 4: Verify
You should see success messages. If there are errors about "already exists", that's fine - it means the column or index is already there.

## What This Fixes
After running this SQL:
- ✅ Analyzed images will be linked to projects when uploaded
- ✅ Project history will show all previous analyses
- ✅ Analyses will persist after you navigate away and come back
- ✅ Deleting a project will automatically clean up its analyses

## Quick SQL (if you prefer to copy-paste)
```sql
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_analyses_project_id ON analyses(project_id);
```

That's the minimum required. The rest is optional but recommended.

## Still Not Working?
1. Check the browser console (F12) for any errors
2. Check the backend logs for upload errors
3. Make sure you're uploading from within a project (not the global upload page)
4. Verify the `project_id` is being passed in the upload request (look for "Linking analysis to project" in the console)
