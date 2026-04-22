-- Link analyses to a team workspace so team history only shows team-run analyses
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE analyses
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_analyses_team_id ON analyses(team_id);
CREATE INDEX IF NOT EXISTS idx_analyses_team_created ON analyses(team_id, created_at DESC);
