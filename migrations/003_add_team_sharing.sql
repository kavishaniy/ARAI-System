-- Create team and project sharing tables
-- Run this SQL in your Supabase SQL Editor

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team members table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',  -- 'owner', 'admin', 'editor', 'member', 'viewer'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Create project sharing table
CREATE TABLE IF NOT EXISTS project_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    access_level VARCHAR(50) DEFAULT 'viewer',  -- 'owner', 'editor', 'viewer'
    shared_by UUID NOT NULL REFERENCES auth.users(id),
    shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT either_team_or_user CHECK ((team_id IS NOT NULL AND user_id IS NULL) OR (team_id IS NULL AND user_id IS NOT NULL))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_teams_created_by ON teams(created_by);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_shares_project_id ON project_shares(project_id);
CREATE INDEX IF NOT EXISTS idx_project_shares_team_id ON project_shares(team_id);
CREATE INDEX IF NOT EXISTS idx_project_shares_user_id ON project_shares(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_shares ENABLE ROW LEVEL SECURITY;

-- Helper functions to avoid recursive RLS checks between teams and team_members.
-- These run with definer privileges, so they can safely inspect membership/ownership
-- without re-entering the same table policies.
CREATE OR REPLACE FUNCTION public.is_team_member(_team_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.team_members
        WHERE team_id = _team_id
          AND user_id = _user_id
    );
$$;

CREATE OR REPLACE FUNCTION public.is_team_owner(_team_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.teams
        WHERE id = _team_id
          AND created_by = _user_id
    );
$$;

REVOKE ALL ON FUNCTION public.is_team_member(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_team_owner(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_team_member(UUID, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_team_owner(UUID, UUID) TO authenticated, service_role;

-- Teams RLS Policies
DROP POLICY IF EXISTS "Users can view teams they're members of" ON teams;
CREATE POLICY "Users can view teams they're members of" ON teams
    FOR SELECT USING (
        auth.uid() = created_by
        OR public.is_team_member(id, auth.uid())
    );

DROP POLICY IF EXISTS "Users can create teams" ON teams;
CREATE POLICY "Users can create teams" ON teams
    FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Team creators can update teams" ON teams;
CREATE POLICY "Team creators can update teams" ON teams
    FOR UPDATE USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Team creators can delete teams" ON teams;
CREATE POLICY "Team creators can delete teams" ON teams
    FOR DELETE USING (auth.uid() = created_by);

-- Team Members RLS Policies
DROP POLICY IF EXISTS "Team members can view team membership" ON team_members;
CREATE POLICY "Team members can view team membership" ON team_members
    FOR SELECT USING (
        auth.uid() = user_id
        OR public.is_team_owner(team_id, auth.uid())
        OR public.is_team_member(team_id, auth.uid())
    );

DROP POLICY IF EXISTS "Team creators can manage members" ON team_members;
CREATE POLICY "Team creators can manage members" ON team_members
    FOR ALL USING (public.is_team_owner(team_id, auth.uid()))
    WITH CHECK (public.is_team_owner(team_id, auth.uid()));

-- Project Shares RLS Policies
DROP POLICY IF EXISTS "Users can view shared projects" ON project_shares;
CREATE POLICY "Users can view shared projects" ON project_shares
    FOR SELECT USING (
        auth.uid() = user_id OR
        auth.uid() = shared_by OR
        (team_id IS NOT NULL AND public.is_team_member(team_id, auth.uid())) OR
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_shares.project_id
            AND projects.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Project owners can share projects" ON project_shares;
CREATE POLICY "Project owners can share projects" ON project_shares
    FOR INSERT WITH CHECK (
        auth.uid() = shared_by AND
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_shares.project_id
            AND projects.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Project owners can manage shares" ON project_shares;
CREATE POLICY "Project owners can manage shares" ON project_shares
    FOR DELETE USING (
        auth.uid() = shared_by OR
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_shares.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Grant permissions
GRANT ALL ON teams TO authenticated;
GRANT ALL ON team_members TO authenticated;
GRANT ALL ON project_shares TO authenticated;
GRANT ALL ON teams TO service_role;
GRANT ALL ON team_members TO service_role;
GRANT ALL ON project_shares TO service_role;
