-- Update analyses table to include all required fields
-- Run this in your Supabase SQL Editor

-- Update the analyses table structure
ALTER TABLE public.analyses 
ADD COLUMN IF NOT EXISTS filename TEXT,
ADD COLUMN IF NOT EXISTS file_path TEXT,
ADD COLUMN IF NOT EXISTS arai_score NUMERIC,
ADD COLUMN IF NOT EXISTS overall_grade TEXT,
ADD COLUMN IF NOT EXISTS conformance_level TEXT,
ADD COLUMN IF NOT EXISTS accessibility_score NUMERIC,
ADD COLUMN IF NOT EXISTS readability_score NUMERIC,
ADD COLUMN IF NOT EXISTS attention_score NUMERIC;

-- Create storage bucket for design uploads (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('design-uploads', 'design-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Users can upload their own designs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own designs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own designs" ON storage.objects;
DROP POLICY IF EXISTS "Service role can manage all designs" ON storage.objects;

-- Storage policies for design uploads
CREATE POLICY "Users can upload their own designs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'design-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own designs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'design-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own designs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'design-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow service role to manage all files
CREATE POLICY "Service role can manage all designs"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'design-uploads');

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON public.analyses(created_at DESC);

-- Verify setup
SELECT * FROM storage.buckets WHERE id = 'design-uploads';
