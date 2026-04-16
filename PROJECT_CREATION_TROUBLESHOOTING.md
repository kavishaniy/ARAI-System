# 🔧 Project Creation Troubleshooting Guide

## Quick Diagnosis

### Symptom 1: "Failed to create project" Error Message

**Check List:**

1. **Is the database table created?**
   ```sql
   -- Run in Supabase SQL Editor
   SELECT * FROM projects LIMIT 1;
   ```
   - ✅ If you see columns, table exists
   - ❌ If error, run the CREATE TABLE script

2. **Is the backend server running?**
   ```bash
   # Should see:
   # INFO:     Uvicorn running on http://127.0.0.1:8000
   ```

3. **Check the backend logs**
   ```bash
   # Watch real-time logs
   cd backend
   python -m uvicorn app.main:app --reload 2>&1 | grep -E "(✅|❌|Error)"
   ```

4. **Is your token valid?**
   - Sign out and sign in again
   - Check browser console for auth errors

---

### Symptom 2: Project Created but Doesn't Show in List

**Diagnosis Steps:**

1. **Check browser Network tab**
   - Open DevTools (F12)
   - Create project
   - Look for POST /api/v1/projects
   - Check Response tab
   - Should see: `{"id": "...", "name": "....", "analysis_count": 0}`

2. **If response looks wrong**
   - Check: Does it have `analysis_count` field?
   - If missing, run this in backend:
   ```python
   # In create_new_project endpoint, verify:
   return Project(
       id=result["id"],
       user_id=result["user_id"],
       name=result["name"],
       description=result.get("description"),
       analysis_count=0,  # ← MUST HAVE THIS
       created_at=result["created_at"],
       updated_at=result.get("updated_at")
   )
   ```

3. **If response is correct but doesn't show**
   - Refresh page (F5)
   - Check browser console for errors
   - Verify `handleCreateProject` in Projects.jsx adds to state

---

### Symptom 3: Modal Doesn't Open

**Check:**

1. **Is button clickable?**
   ```bash
   # Open DevTools Console (F12)
   # Click "New Project" button
   # Should see no errors
   ```

2. **Is CreateProjectModal imported?**
   ```javascript
   // In Projects.jsx, line 2 should have:
   import CreateProjectModal from './CreateProjectModal';
   ```

3. **Check modal visibility logic**
   - Look for: `showCreateModal` state
   - Modal should render when true
   - Button should toggle it

---

### Symptom 4: Form Validation Issues

**Common Errors:**

1. **"Project name is required"**
   - ✅ This is correct - name cannot be empty
   - Try entering a name

2. **"Project name must be less than 255 characters"**
   - Your name is too long
   - Use a shorter name

3. **"Description must be less than 1000 characters"**
   - Description is too long
   - Use shorter description

---

## 🔍 Step-by-Step Verification

### Step 1: Verify Database

```sql
-- 1. Check table exists
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'projects';

-- 2. Check structure
SELECT * FROM projects LIMIT 1;

-- 3. Check RLS enabled
SELECT relname, relrowsecurity FROM pg_class 
WHERE relname = 'projects';
```

Expected:
- Table exists ✅
- Columns: id, user_id, name, description, created_at, updated_at ✅
- Row security: true ✅

---

### Step 2: Verify Backend

```bash
# 1. Backend running?
curl http://localhost:8000/docs

# 2. Check projects endpoint
curl -X POST http://localhost:8000/api/v1/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name": "Test", "description": ""}'
```

Expected:
- Docs page loads ✅
- POST returns 200 with project data ✅

---

### Step 3: Verify Frontend

```javascript
// In browser console (F12):
// 1. Check API client
console.log(api);

// 2. Check service
import { projectService } from './services/projects.js';
console.log(projectService);

// 3. Try creating manually
projectService.createProject('Test', 'Description')
  .then(p => console.log('✅ Success:', p))
  .catch(e => console.log('❌ Error:', e));
```

Expected:
- API client configured ✅
- Service functions exist ✅
- Manual creation works ✅

---

## 🛠️ Common Fixes

### Fix 1: Add Missing analysis_count

**File**: `backend/app/api/projects.py` Line ~69

```python
# Change from:
return Project(
    id=result["id"],
    user_id=result["user_id"],
    name=result["name"],
    description=result.get("description"),
    created_at=result["created_at"],
    updated_at=result.get("updated_at")
)

# To:
return Project(
    id=result["id"],
    user_id=result["user_id"],
    name=result["name"],
    description=result.get("description"),
    analysis_count=0,  # ← ADD THIS LINE
    created_at=result["created_at"],
    updated_at=result.get("updated_at")
)
```

---

### Fix 2: Create Database Table

**Run in Supabase SQL Editor:**

```sql
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own projects" ON projects
    FOR ALL USING (auth.uid() = user_id);
```

---

### Fix 3: Update Frontend State

**File**: `frontend/src/components/Pages/Projects.jsx` Line ~35

```javascript
// In handleCreateProject, after creating:
const newProject = await projectService.createProject(...);

// Ensure state updates:
setProjects([newProject, ...projects]);  // Add to list
setShowCreateModal(false);                // Close modal
setSelectedProject(newProject);           // Auto-open dashboard
```

---

## 📱 Testing with Postman

### Setup

1. Open Postman
2. Get your JWT token from browser (DevTools → Application → localStorage → auth)

### Test Create Project

```
Method: POST
URL: http://localhost:8000/api/v1/projects

Headers:
Authorization: Bearer <YOUR_TOKEN>
Content-Type: application/json

Body (JSON):
{
  "name": "Test Project",
  "description": "Testing with Postman"
}
```

**Expected Response (200):**
```json
{
  "id": "...",
  "user_id": "...",
  "name": "Test Project",
  "description": "Testing with Postman",
  "analysis_count": 0,
  "created_at": "2026-04-16T...",
  "updated_at": "2026-04-16T..."
}
```

### Test List Projects

```
Method: GET
URL: http://localhost:8000/api/v1/projects?search=&limit=100

Headers:
Authorization: Bearer <YOUR_TOKEN>
```

**Expected Response (200):**
```json
{
  "projects": [
    { "id": "...", "name": "Test Project", ... }
  ],
  "total": 1
}
```

---

## 📋 Verification Checklist

Before declaring success, verify:

- [ ] Database table exists and has correct columns
- [ ] Backend server is running on http://localhost:8000
- [ ] Frontend server is running on http://localhost:3000
- [ ] You are signed in (sidebar shows your name)
- [ ] Can navigate to /projects
- [ ] Can open create modal
- [ ] Can submit form without errors
- [ ] Browser network shows 200 response
- [ ] Response includes all fields (with analysis_count)
- [ ] Project appears in list immediately
- [ ] Can click project to open dashboard
- [ ] Can go back to list
- [ ] Can search projects
- [ ] Can edit project name
- [ ] Can delete project

---

## 🚨 If All Else Fails

### Nuclear Option (Reset Everything)

```bash
# 1. Stop servers
# Ctrl+C in both terminals

# 2. Clear frontend cache
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start

# 3. Restart backend
cd backend
python -m uvicorn app.main:app --reload

# 4. Check database
# - Go to Supabase
# - Delete projects table
# - Run CREATE TABLE script

# 5. Sign out and back in
# - Clear localStorage
# - Sign out
# - Sign in again
```

---

## 📞 Getting Help

### Provide This Information

1. **Error message** (exact text)
2. **Browser console** output (F12)
3. **Network tab** response (F12 → Network)
4. **Backend logs** (last 10 lines)
5. **Database status** (SELECT * FROM projects LIMIT 1)

### Useful Debug Commands

```bash
# View backend logs
tail -100 backend/backend.log

# Check database
# Go to: https://app.supabase.com → SQL Editor

# View network requests
# F12 → Network tab → Create project → Check POST response

# Clear browser cache
# F12 → Application → Storage → Clear all
```

---

**Last Updated**: April 16, 2026
**Status**: ✅ Complete
**Version**: 1.0

Good luck! You've got this! 🚀
