-- Create/Update analyses table with project linking
-- Run this SQL in your Supabase SQL Editor if analyses table exists

-- If analyses table doesn't have project_id, add it:
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_analyses_project_id ON analyses(project_id);

-- Create index for getting analyses by project and date
CREATE INDEX IF NOT EXISTS idx_analyses_project_created ON analyses(project_id, created_at DESC);

-- If you want to auto-update analyses to show analysis_count in projects,
-- create a trigger to update projects.updated_at when analyses are added/removed:

-- Create or replace function
CREATE OR REPLACE FUNCTION update_project_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE projects
  SET updated_at = NOW()
  WHERE id = NEW.project_id OR id = OLD.project_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_project_on_analysis_change ON analyses;

-- Create trigger
CREATE TRIGGER update_project_on_analysis_change
AFTER INSERT OR UPDATE OR DELETE ON analyses
FOR EACH ROW
EXECUTE FUNCTION update_project_timestamp();
