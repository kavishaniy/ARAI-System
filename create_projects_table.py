#!/usr/bin/env python
"""
Create the projects table in Supabase
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app.core.config import settings
from supabase import create_client

# Initialize Supabase client
supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

def create_projects_table():
    """Create the projects table using SQL"""
    
    sql = """
    CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by UUID REFERENCES auth.users(id),
        CONSTRAINT unique_project_name_per_user UNIQUE(user_id, name)
    );
    
    -- Create index for faster queries
    CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
    CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
    
    -- Enable RLS (Row Level Security)
    ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
    
    -- Create RLS policies
    DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
    CREATE POLICY "Users can view their own projects" ON projects
        FOR SELECT USING (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can create their own projects" ON projects;
    CREATE POLICY "Users can create their own projects" ON projects
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
    CREATE POLICY "Users can update their own projects" ON projects
        FOR UPDATE USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
    CREATE POLICY "Users can delete their own projects" ON projects
        FOR DELETE USING (auth.uid() = user_id);
    """
    
    try:
        print("🔄 Creating projects table...")
        result = supabase.postgrest.rpc('execute_sql', {'sql': sql}).execute()
        print("✅ Projects table created successfully!")
        return True
    except Exception as e:
        # Try a simpler approach using REST API
        print(f"⚠️  RPC method not available, trying direct SQL execution...")
        print(f"   Error: {str(e)}")
        
        # Since we can't execute raw SQL directly, we'll use a workaround
        # by creating through the REST API
        try:
            print("\n📝 Creating table through Supabase console SQL editor...")
            print("\n🔗 Go to: https://app.supabase.com/project/_/sql/new")
            print("\n📋 Copy and paste the SQL below:\n")
            print("=" * 70)
            print(sql)
            print("=" * 70)
            print("\n✅ Run the SQL in your Supabase dashboard")
            return False
        except Exception as e2:
            print(f"   ❌ Error: {str(e2)}")
            return False

if __name__ == "__main__":
    success = create_projects_table()
    sys.exit(0 if success else 1)
