-- Create pending team invitations table
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS team_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'member',
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    accepted_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    UNIQUE(team_id, email)
);

CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON team_invitations(status);

ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team owners can manage invitations" ON team_invitations;
CREATE POLICY "Team owners can manage invitations" ON team_invitations
    FOR ALL USING (public.is_team_owner(team_id, auth.uid()))
    WITH CHECK (public.is_team_owner(team_id, auth.uid()));

GRANT ALL ON team_invitations TO authenticated;
GRANT ALL ON team_invitations TO service_role;
