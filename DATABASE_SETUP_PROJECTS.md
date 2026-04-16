# Project Management Database Setup Guide

## Overview
This guide explains how to set up the database tables needed for the Project Management feature in Supabase.

## Required Supabase Tables

### 1. Projects Table
Create a new table `projects` with the following structure:

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for better query performance
  CONSTRAINT projects_user_id_fk FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_name ON projects USING gin(to_tsvector('english', name));
```

### 2. Update Analyses Table
Add `project_id` column to existing `analyses` table:

```sql
ALTER TABLE analyses ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE CASCADE;

-- Create index
CREATE INDEX idx_analyses_project_id ON analyses(project_id);
```

## Row Level Security (RLS) Policies

### For Projects Table

```sql
-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own projects
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create projects
CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own projects
CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own projects
CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);
```

### For Analyses Table (Update existing)

```sql
-- Update the SELECT policy to include project filtering
DROP POLICY IF EXISTS "Users can see their own analyses" ON analyses;

CREATE POLICY "Users can see their own analyses"
  ON analyses FOR SELECT
  USING (auth.uid() = user_id OR project_id IN (
    SELECT id FROM projects WHERE user_id = auth.uid()
  ));

-- Update the UPDATE policy to include project ownership check
DROP POLICY IF EXISTS "Users can update their own analyses" ON analyses;

CREATE POLICY "Users can update their own analyses"
  ON analyses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND 
    (project_id IS NULL OR project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    ))
  );

-- Update the DELETE policy
DROP POLICY IF EXISTS "Users can delete their own analyses" ON analyses;

CREATE POLICY "Users can delete their own analyses"
  ON analyses FOR DELETE
  USING (auth.uid() = user_id);

-- Update the INSERT policy to support project_id
DROP POLICY IF EXISTS "Users can create analyses" ON analyses;

CREATE POLICY "Users can create analyses"
  ON analyses FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    (project_id IS NULL OR project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    ))
  );
```

## Steps to Apply

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project

2. **Go to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Create Projects Table**
   - Copy and paste the SQL for the `projects` table
   - Click "Run"

4. **Update Analyses Table**
   - Add the `project_id` column to existing `analyses` table
   - Click "Run"

5. **Apply RLS Policies**
   - Copy and paste the RLS policy SQL for projects
   - Click "Run"
   - Then apply the updated policies for analyses

## Verification

After applying the migrations, you can verify the tables were created:

```sql
-- Check projects table
SELECT * FROM information_schema.tables 
WHERE table_name = 'projects';

-- Check columns
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'projects';

-- Check project_id column in analyses
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'analyses' AND column_name = 'project_id';
```

## Notes

- The `project_id` in analyses is optional (nullable) to support existing analyses
- RLS policies ensure users can only access their own projects and analyses
- Service role key can bypass RLS (used in backend API)
- User key respects RLS policies (used in frontend)

## Testing with Backend API

Once tables are created, test the backend API:

```bash
# Create a project
curl -X POST http://localhost:8000/api/v1/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Test Project",
    "description": "Test project for design analysis"
  }'

# List projects
curl -X GET "http://localhost:8000/api/v1/projects" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get project details
curl -X GET "http://localhost:8000/api/v1/projects/PROJECT_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

**Issue**: "permission denied for schema public"
- **Solution**: Make sure you're using the right role with sufficient permissions in Supabase

**Issue**: Foreign key constraint errors
- **Solution**: Ensure `auth.users` table exists and user_id references are correct

**Issue**: RLS policies not working
- **Solution**: Verify RLS is enabled on the table and policies are correctly configured

## Future Enhancements

- Add project sharing (share projects with team members)
- Add project templates for quick project setup
- Add project activity logs
- Add project analytics dashboard
