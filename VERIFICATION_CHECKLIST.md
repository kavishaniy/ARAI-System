# ✅ Quick Verification Checklist

After running the Supabase migration, verify that everything is working:

## System Status Check
- [ ] Backend is running (uvicorn on port 8000)
- [ ] Frontend is running (React dev server on port 3000)
- [ ] Can access http://localhost:3000
- [ ] Supabase migration SQL was executed successfully

## Feature Test

### Test 1: Upload Analysis to Project
- [ ] Create a new test project (or use existing)
- [ ] Go to "Analyze Design" tab
- [ ] Upload a design image
- [ ] Wait for analysis to complete (30-60 seconds)
- [ ] **Expected**: Analysis appears in local state immediately

### Test 2: Check History Tab
- [ ] Click "History (1)" tab
- [ ] **Expected**: Uploaded design appears with all scores:
  - [ ] Design name displayed
  - [ ] Date displayed
  - [ ] Accessibility score
  - [ ] Readability score
  - [ ] Attention score
  - [ ] Overall score

### Test 3: Persistence Test (The Critical One!)
- [ ] Click back button (go to Projects list)
- [ ] Click on the same project again
- [ ] **Expected**: Design is STILL in the History tab
  - If YES ✅ → Feature is working!
  - If NO ❌ → Database migration may have failed

### Test 4: Multiple Uploads
- [ ] Upload 2-3 more designs to the same project
- [ ] History should show: History (4) or History (5)
- [ ] All uploaded designs should appear

### Test 5: Project Isolation
- [ ] Create a second project
- [ ] Go to its History tab
- [ ] **Expected**: Only shows analyses from THIS project
- [ ] Analyses from first project should NOT appear here

### Test 6: Final Persistence Check
- [ ] Navigate away from both projects
- [ ] Come back to each project
- [ ] **Expected**: Each project shows only its own analyses

## Browser Console Verification

Open F12 (Developer Tools) and look for these log messages:

### During Upload:
```
✅ Analysis complete, results: {...}
📁 Linking analysis to project: [UUID]
📝 Adding 1 analyses to local state
```

### After 2 seconds:
```
⏳ Waiting 2 seconds before fetching from backend...
🔄 Fetching updated project details from backend...
📊 Project detail response: {...}
✅ Setting analyses from backend: 1 items
```

### Expected console output pattern:
```
📤 Upload request from user: [UUID]
📋 Project ID: [project-UUID]
📁 Analysis will be linked to project: [project-UUID]
✅ Analysis saved to database: [analysis-UUID]
✅ Project detail response: {...}
📈 Analyses from response: [...]
```

## Network Tab Verification

Open F12 → Network tab → Upload an analysis

Look for the POST request to `/analysis/upload`:

### Request Form Data should include:
- `file` (the image file)
- `design_name` (image name)
- `project_id` (UUID of your project) ← **This is key!**

### Response should include:
```json
{
  "analysis_id": "[UUID]",
  "design_name": "[name]",
  "arai_score": [number],
  "arai_breakdown": {
    "accessibility": [number],
    "readability": [number],
    "attention": [number],
    "overall": [number]
  }
}
```

## Database Verification

Run this command to verify project_id column exists:

```bash
python3 test_project_analyses.py
```

Should show:
```
✅ Found [N] total analyses
Found [N] unique project IDs
🔗 Testing with project ID: [UUID]
✅ Found [N] analyses for this project
```

If you see "No analyses have a project_id set" → Migration may not have worked

## Common Issues & Fixes

### Issue: "Analyses still disappear after navigating away"
- [ ] Check Supabase migration was completed
- [ ] Run `python3 test_project_analyses.py` to verify column exists
- [ ] Check browser console for errors
- [ ] Check backend logs for errors

### Issue: "Project ID shows as None in logs"
- [ ] Verify you're uploading from WITHIN a project (not global upload)
- [ ] Check Network tab to ensure project_id is in Form Data
- [ ] Verify `Form(None)` parameters in backend/app/api/analysis.py

### Issue: "Analysis uploads but doesn't show in History tab"
- [ ] Wait 2 seconds for backend to fetch updated data
- [ ] Check browser console for any error messages
- [ ] Check backend logs for save errors
- [ ] Try refreshing the page manually (F5)

### Issue: "Different projects showing same analyses"
- [ ] Check database - might be old analyses without project_id
- [ ] New analyses should be project-specific
- [ ] Old analyses (before migration) won't have project_id set

## Success Criteria ✅

Feature is **WORKING** if:

1. ✅ You can upload an analysis while viewing a project
2. ✅ Analysis appears in the History (X) tab immediately
3. ✅ All 4 scores are displayed (Accessibility, Readability, Attention, Overall)
4. ✅ You can navigate away from the project
5. ✅ When you come back, the analysis is STILL there
6. ✅ You can upload multiple analyses and see them all listed
7. ✅ Different projects show only their own analyses
8. ✅ No errors in browser console
9. ✅ No errors in backend logs

## Contact & Support

If any tests fail:
1. Check this guide's "Common Issues & Fixes" section
2. Review `DATABASE_MIGRATION_REQUIRED.md` - ensure SQL was run
3. Check `TESTING_GUIDE.md` for detailed step-by-step instructions
4. Check logs: Backend logs and Browser Console (F12)

---

**Everything working? 🎉 You're done!**

The analyzed images will now be stored in the project history and persist across sessions!
