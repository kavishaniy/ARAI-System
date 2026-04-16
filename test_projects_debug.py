#!/usr/bin/env python
"""
Test script to diagnose project creation issues
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

import asyncio
from app.core.config import settings
from app.core.database import supabase_admin, create_project, get_user_projects
import uuid
from datetime import datetime

async def test_projects():
    print("=" * 60)
    print("🔍 Project Creation Diagnostic Test")
    print("=" * 60)
    
    # Test 1: Check Supabase connection
    print("\n1️⃣  Testing Supabase connection...")
    try:
        # List tables
        response = supabase_admin.table("projects").select("*").limit(1).execute()
        print(f"   ✅ Supabase connection OK")
        print(f"   📊 Current projects count: {len(response.data) if response.data else 0}")
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        print(f"   📝 Make sure 'projects' table exists in Supabase")
        return
    
    # Test 2: Get a real user from auth.users
    print("\n2️⃣  Getting a real user for testing...")
    try:
        # Get any authenticated user
        users_response = supabase_admin.table("auth.users").select("id").limit(1).execute()
        
        if users_response.data and len(users_response.data) > 0:
            test_user_id = users_response.data[0]['id']
            print(f"   ✅ Found existing user: {test_user_id}")
        else:
            print(f"   ⚠️  No users found in auth.users")
            print(f"   📝 You need to have at least one authenticated user")
            print(f"   📝 Please log in to the application first")
            return
    except Exception as e:
        print(f"   ⚠️  Cannot access auth.users table")
        print(f"   📝 This is expected - using service role for admin access")
        # Continue anyway - let's try to create a project with a random UUID
        test_user_id = str(uuid.uuid4())
        print(f"   ℹ️  Using test user ID: {test_user_id}")
    
    # Test 3: Try creating a project
    print("\n3️⃣  Testing project creation...")
    try:
        project = await create_project(
            user_id=test_user_id,
            project_name="Test Project from Debug Script",
            project_description="This is a test project"
        )
        print(f"   ✅ Project created successfully!")
        print(f"   📋 Project Details:")
        print(f"      - ID: {project['id']}")
        print(f"      - Name: {project['name']}")
        print(f"      - User ID: {project['user_id']}")
        print(f"      - Description: {project.get('description', 'N/A')}")
        print(f"      - Created At: {project.get('created_at', 'N/A')}")
    except Exception as e:
        print(f"   ❌ Error creating project: {str(e)}")
        print(f"   💡 This might be a foreign key constraint issue")
        print(f"   💡 Make sure the user_id exists in auth.users table")
        return
    
    # Test 4: Try retrieving projects
    print("\n4️⃣  Testing project retrieval...")
    try:
        projects = await get_user_projects(test_user_id, limit=100)
        print(f"   ✅ Projects retrieved successfully!")
        print(f"   📊 Found {len(projects)} projects")
        for p in projects:
            print(f"      - {p['name']} (ID: {p['id']})")
    except Exception as e:
        print(f"   ❌ Error retrieving projects: {str(e)}")
    
    print("\n" + "=" * 60)
    print("✅ Diagnostic test complete!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_projects())
