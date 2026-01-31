# 🗄️ Supabase Database & Storage Setup Guide

This guide will help you set up Supabase database and storage for the ARAI system to store uploaded designs and analysis history.

---

## 📋 Prerequisites

- Supabase account and project created
- Access to Supabase SQL Editor
- Backend `.env` file configured with Supabase credentials

---

## 🚀 Setup Steps

### Step 1: Update the Analyses Table

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor** (left sidebar)
3. Click **"New Query"**
4. Copy and paste the contents of `backend/scripts/update_analyses_table.sql`
5. Click **"Run"** to execute the SQL

This will:
- Add new columns to the `analyses` table (filename, file_path, scores, etc.)
- Create the `design-uploads` storage bucket
- Set up Row Level Security (RLS) policies for file access
- Create indexes for faster queries

### Step 2: Verify the Setup

Run this query in the SQL Editor to verify:

```sql
-- Check if storage bucket exists
SELECT * FROM storage.buckets WHERE id = 'design-uploads';

-- Check analyses table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'analyses';

-- Check storage policies
SELECT policyname, cmd FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';
```

### Step 3: Test Upload (Optional - Manual Test)

You can test file upload via Supabase Dashboard:

1. Go to **Storage** in Supabase Dashboard
2. You should see the `design-uploads` bucket
3. Try uploading a test image manually
4. Verify you can view it

---

## 🔧 What Changed in the Backend

### New File: `backend/app/core/database.py`

This file provides database utilities:

- `upload_design_to_storage()` - Uploads files to Supabase Storage
- `save_analysis_to_db()` - Saves analysis results to database
- `get_user_analyses()` - Fetches user's analysis history
- `get_analysis_by_id()` - Retrieves specific analysis
- `delete_analysis()` - Deletes analysis from DB and storage
- `update_analysis_status()` - Updates analysis status

### Updated: `backend/app/api/analysis.py`

**Key Changes:**

1. **Authentication Required** - All endpoints now require JWT token
2. **Supabase Storage** - Files are uploaded to cloud storage
3. **Database Persistence** - Analysis history saved to `analyses` table
4. **User-Specific Data** - Users can only see their own analyses

**Updated Endpoints:**

```python
POST   /api/v1/analysis/upload    # Now requires auth token
GET    /api/v1/analysis/results/:id # Now requires auth token
GET    /api/v1/analysis/history   # Now requires auth token, returns user's data
DELETE /api/v1/analysis/results/:id # Now requires auth token
```

---

## 📊 Database Schema

### `analyses` Table Structure

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (analysis_id) |
| `user_id` | UUID | Foreign key to profiles |
| `design_name` | TEXT | User-provided design name |
| `filename` | TEXT | Original filename |
| `file_path` | TEXT | Path in Supabase Storage |
| `status` | TEXT | pending/processing/completed/failed |
| `arai_score` | NUMERIC | Overall ARAI score |
| `overall_grade` | TEXT | Letter grade (A-F) |
| `conformance_level` | TEXT | WCAG conformance (A/AA/AAA) |
| `accessibility_score` | NUMERIC | Accessibility score |
| `readability_score` | NUMERIC | Readability score |
| `attention_score` | NUMERIC | Attention score |
| `results` | JSONB | Full analysis results |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

### Storage Structure

```
design-uploads/
  ├── {user_id}/
  │   ├── 20260129_143052_dashboard.png
  │   ├── 20260129_145123_login.png
  │   └── ...
  ├── {another_user_id}/
  │   └── ...
```

---

## 🔐 Security Features

### Row Level Security (RLS)

✅ **Users can only access their own data:**
- View their own analyses
- Upload to their own folder
- Delete their own files

✅ **Service role has full access:**
- Backend API uses service key
- Can manage all data for operations

### Storage Policies

```sql
-- Users can upload to their own folder
{user_id}/*.png

-- Users can view their own designs
{user_id}/*

-- Users can delete their own designs
{user_id}/*
```

---

## 🧪 Testing the Integration

### 1. Start the Backend

```bash
cd backend
uvicorn app.main:app --reload
```

### 2. Start the Frontend

```bash
cd frontend
npm start
```

### 3. Test Upload Flow

1. Login to the app
2. Go to "Upload Design" tab
3. Upload a design image
4. Wait for analysis to complete
5. Check results display

### 4. Verify in Supabase

1. Go to **Table Editor** → `analyses`
2. You should see a new row with:
   - Your user_id
   - Design name
   - Scores
   - Full results in JSONB

3. Go to **Storage** → `design-uploads`
4. You should see your file under `{your_user_id}/`

### 5. Test History

1. Click "History" tab in the app
2. You should see your uploaded analysis
3. Click on it to view full results

---

## 📝 Frontend Usage (Already Implemented)

The frontend automatically:

✅ Sends JWT token with all requests  
✅ Handles authentication errors  
✅ Fetches user-specific history  
✅ Displays analysis results  

**No frontend changes needed!** Just update the database.

---

## 🐛 Troubleshooting

### Error: "Storage bucket not found"

**Solution:** Run the SQL script again to create the bucket.

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('design-uploads', 'design-uploads', false)
ON CONFLICT (id) DO NOTHING;
```

### Error: "Permission denied for storage"

**Solution:** Check storage policies:

```sql
-- Verify policies exist
SELECT * FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';
```

### Error: "Column does not exist"

**Solution:** The `analyses` table needs updating. Run the SQL script.

### Error: "Authentication failed"

**Solution:** Ensure:
1. User is logged in
2. Token is in localStorage
3. Token is not expired
4. SUPABASE_URL and SUPABASE_SERVICE_KEY in `.env`

---

## 🎯 Benefits of This Implementation

### ✅ Data Persistence
- All analyses saved to database
- Survives server restarts
- No data loss

### ✅ Cloud Storage
- Files stored in Supabase Storage
- Accessible from anywhere
- Automatic backups

### ✅ User Privacy
- RLS ensures users only see their own data
- No cross-user data leakage
- Secure file access

### ✅ Analysis History
- Track all past analyses
- View historical results
- Delete old analyses

### ✅ Scalability
- Supabase handles storage management
- PostgreSQL optimized queries
- Indexes for fast retrieval

---

## 📚 Next Steps

1. ✅ Run the SQL script in Supabase
2. ✅ Verify storage bucket created
3. ✅ Restart backend server
4. ✅ Test upload flow
5. ✅ Verify data in Supabase Dashboard
6. ✅ Test history retrieval
7. ✅ Test analysis deletion

---

## 🎉 Success Checklist

After setup, you should be able to:

- [ ] Upload designs through the web interface
- [ ] See files appear in Supabase Storage
- [ ] See analysis records in `analyses` table
- [ ] View analysis history in the app
- [ ] Click on past analyses to view results
- [ ] Delete analyses (removes from DB and storage)
- [ ] Each user sees only their own data

---

## 📞 Support

If you encounter issues:

1. Check backend logs for errors
2. Verify Supabase credentials in `.env`
3. Ensure SQL script ran successfully
4. Check browser console for frontend errors
5. Verify user is logged in (token exists)

---

**Status:** Ready to deploy! Just run the SQL script and test. 🚀
