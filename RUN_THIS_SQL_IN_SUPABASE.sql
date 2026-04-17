-- SQL Migration: Add Project Linking to Analyses Table
-- Copy and run this SQL in your Supabase SQL Editor: https://app.supabase.com/project/_/sql/new

-- Step 1: Add project_id column if it doesn't exist
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;

-- Step 2: Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_analyses_project_id ON analyses(project_id);
CREATE INDEX IF NOT EXISTS idx_analyses_project_created ON analyses(project_id, created_at DESC);

-- Step 3: Create trigger function to update project timestamp
CREATE OR REPLACE FUNCTION update_project_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE projects
  SET updated_at = NOW()
  WHERE id = NEW.project_id OR id = OLD.project_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger
DROP TRIGGER IF EXISTS update_project_on_analysis_change ON analyses;
CREATE TRIGGER update_project_on_analysis_change
AFTER INSERT OR UPDATE OR DELETE ON analyses
FOR EACH ROW
EXECUTE FUNCTION update_project_timestamp();

-- Verification query - check if project_id column exists
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name='analyses' AND column_name='project_id';
