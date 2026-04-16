# ✅ Project Creation End-to-End Testing Guide

## Overview

This guide walks through the complete project creation flow to ensure everything works correctly.

---

## 🚀 Quick Start

### 1. Start the Servers

**Terminal 1 - Backend**
```bash
cd backend
python -m uvicorn app.main:app --reload
```

Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

**Terminal 2 - Frontend**
```bash
cd frontend
npm start
```

Expected output:
```
webpack compiled successfully
Compiled successfully! App running at http://localhost:3000
```

---

## 📋 Database Prerequisites

Before creating projects, ensure the database table exists:

### Step 1: Create Projects Table in Supabase

Go to **Supabase Dashboard** → **SQL Editor** and run:

```sql
-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can only see their own projects" ON projects
    FOR ALL USING (auth.uid() = user_id);
```

### Step 2: Verify Table

Run this query to confirm:
```sql
SELECT * FROM projects LIMIT 1;
```

You should see the columns:
- `id` (UUID)
- `user_id` (UUID)
- `name` (TEXT)
- `description` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

---

## 🧪 Test Flow

### Test 1: Sign In

1. Open http://localhost:3000
2. Sign in with your account
3. You should see the app dashboard
4. **Check**: Sidebar shows your name

**Expected**: ✅ Authenticated

---

### Test 2: Navigate to Projects

1. Click "Projects" in sidebar
2. URL should be http://localhost:3000/projects
3. You should see the Projects page with:
   - Title: "Projects"
   - Subtitle: "Organize and manage your design analyses"
   - Search box
   - "New Project" button
   - Empty state (if no projects yet)

**Expected**: ✅ Page loads

---

### Test 3: Open Create Modal

1. Click "New Project" button
2. Modal should appear with:
   - Title: "Create New Project"
   - Project Name input (required)
   - Description textarea (optional)
   - Cancel and Create buttons
   - Character counters

**Expected**: ✅ Modal visible

---

### Test 4: Create Project (First Time)

1. In modal, enter:
   - **Name**: "My First Design"
   - **Description**: "Testing the project creation flow"

2. Click "Create Project" button

3. Watch for:
   - Button shows loading state: "⏳ Creating..."
   - Modal closes after success
   - New project appears in the list
   - Project details show:
     - Name: "My First Design"
     - Description visible
     - "0 analyses" stat
     - Created date

**Expected**: ✅ Project created and visible

**Browser Console** should show:
```
✅ Project created successfully: {id: "...", name: "My First Design", ...}
```

---

### Test 5: Create Another Project

1. Click "New Project" again
2. Enter:
   - **Name**: "Mobile App Redesign"
   - **Description**: (leave empty)

3. Click "Create Project"

**Expected**: ✅ Both projects visible in list

---

### Test 6: Search Projects

1. In search box, type: "Mobile"
2. List should filter to show only "Mobile App Redesign"
3. Type: "First"
4. List should show only "My First Design"
5. Clear search
6. Both projects should reappear

**Expected**: ✅ Search works

---

### Test 7: Open Project Dashboard

1. Click on "My First Design" project
2. Dashboard should open showing:
   - Back button
   - Project title
   - Edit and Delete buttons
   - Statistics (0 analyses, created date, last updated)
   - Two tabs: "Overview" and "Analyses"
   - Overview tab content

**Expected**: ✅ Dashboard loads

---

### Test 8: Edit Project

1. In dashboard, click "Edit" button
2. Name field should become editable
3. Change name to: "My First Design v2"
4. Click "Save" button
5. Dashboard should update with new name
6. Go back to projects list
7. Name should be updated there too

**Expected**: ✅ Changes saved

---

### Test 9: Delete Project

1. In dashboard, click "Delete" button
2. Confirmation dialog: "Are you sure you want to delete this project?"
3. Click "OK"
4. Should go back to projects list
5. Deleted project should be gone

**Expected**: ✅ Project deleted

---

## 🔍 Debugging Checklist

### Frontend Issues

**Modal doesn't appear**
- [ ] Check browser console for errors
- [ ] Verify CreateProjectModal.jsx is imported
- [ ] Check state: `showCreateModal` should be true

**Submit button doesn't work**
- [ ] Check console for errors
- [ ] Verify form validation (name required)
- [ ] Check network tab (XHR requests)

**Project doesn't appear in list**
- [ ] Check browser console
- [ ] Check network tab for API response
- [ ] Verify response has `id` and `name` fields
- [ ] Check `handleCreateProject` adds to state

**Styling looks off**
- [ ] Clear browser cache
- [ ] Hard refresh (Cmd+Shift+R)
- [ ] Check console for CSS errors

### Backend Issues

**API returns 401**
- [ ] Check authorization header
- [ ] Verify JWT token is valid
- [ ] Check backend logs

**API returns 500**
- [ ] Check backend logs for errors
- [ ] Verify database table exists
- [ ] Check Supabase service key

**Project not saved to database**
- [ ] Check Supabase dashboard
- [ ] Run: `SELECT * FROM projects;`
- [ ] Verify row exists

---

## 📊 Expected API Calls

### Create Project Request

```
POST /api/v1/projects
Headers:
  Authorization: Bearer {token}
  Content-Type: application/json

Body:
{
  "name": "My First Design",
  "description": "Testing..."
}
```

### Expected Response (Success - 200)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "My First Design",
  "description": "Testing...",
  "analysis_count": 0,
  "created_at": "2026-04-16T10:30:00",
  "updated_at": "2026-04-16T10:30:00"
}
```

### List Projects Request

```
GET /api/v1/projects?search=&limit=100
Headers:
  Authorization: Bearer {token}
```

### Expected Response

```json
{
  "projects": [
    {
      "id": "...",
      "user_id": "...",
      "name": "My First Design",
      "description": "...",
      "analysis_count": 0,
      "created_at": "2026-04-16T10:30:00",
      "updated_at": "2026-04-16T10:30:00"
    }
  ],
  "total": 1
}
```

---

## 🐛 Common Issues & Solutions

### Issue: "Failed to create project"

**Cause**: Database table doesn't exist

**Solution**:
1. Go to Supabase → SQL Editor
2. Run the CREATE TABLE script (see above)
3. Verify table exists
4. Try creating project again

### Issue: "Authorization header missing"

**Cause**: Token not being sent

**Solution**:
1. Check you're logged in (sidebar shows name)
2. Check browser console for errors
3. Verify API client includes Authorization header
4. Check localStorage for `auth` data

### Issue: Project appears in modal but doesn't show in list

**Cause**: State not updating correctly

**Solution**:
1. Refresh page (F5)
2. Check network tab - API returned success?
3. Check response has all required fields
4. Try creating another project

### Issue: "Cannot read property 'id' of undefined"

**Cause**: API response format incorrect

**Solution**:
1. Check backend logs
2. Verify Project schema includes `analysis_count`
3. Check response includes all fields
4. Use Postman to test API directly

---

## ✅ Success Criteria

A successful project creation flow should:

- [x] Modal opens when clicking "New Project"
- [x] Form validates (name required)
- [x] Submit button shows loading state
- [x] API call succeeds (200 response)
- [x] Project appears in list immediately
- [x] Project has correct name and description
- [x] Project has 0 analyses count
- [x] Created date is current
- [x] Can click to view dashboard
- [x] Can search for project
- [x] Can edit project
- [x] Can delete project
- [x] All updates reflect immediately

---

## 📝 Test Results Template

Use this to document your test:

```
Test Date: ___________
Tested By: ___________

TEST RESULTS:
[ ] Database table created
[ ] Backend server running
[ ] Frontend server running
[ ] Can sign in
[ ] Can navigate to Projects
[ ] Can open create modal
[ ] Can create first project
[ ] Can create second project
[ ] Can search projects
[ ] Can view dashboard
[ ] Can edit project
[ ] Can delete project

Issues Found:
___________________________________
___________________________________

Status: [ ] PASS [ ] FAIL
```

---

## 🚀 Next Steps

If all tests pass:

1. ✅ You can start uploading designs
2. ✅ You can organize designs by project
3. ✅ You can run analyses within projects
4. ✅ You can manage project settings

---

## 📞 Need Help?

### Check Logs

**Backend**:
```bash
# Watch logs
tail -f backend.log

# Look for lines with:
# ✅ (success)
# ❌ (errors)
```

**Frontend**:
```bash
# Open browser console (F12)
# Look for red error messages
```

### Network Debugging

1. Open DevTools (F12)
2. Go to Network tab
3. Create a project
4. Look for POST /api/v1/projects
5. Check:
   - Status: 200 (success)
   - Response: Has id, name, analysis_count
   - Headers: Authorization present

---

**Last Updated**: April 16, 2026
**Status**: ✅ Complete
**Version**: 1.0
