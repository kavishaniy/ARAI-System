#!/usr/bin/env python
"""
Test to check RLS policy issues
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app.core.config import settings
from app.core.database import supabase_admin

# Test 1: Check if table exists and has data
print("1️⃣ Checking projects table...")
try:
    response = supabase_admin.table("projects").select("*").execute()
    print(f"✅ Table exists. Current count: {len(response.data)}")
    if response.data:
        print(f"   Sample data: {response.data[0]}")
except Exception as e:
    print(f"❌ Error: {str(e)}")

# Test 2: Try to insert directly
print("\n2️⃣ Testing direct insert...")
try:
    import uuid
    test_id = str(uuid.uuid4())
    test_data = {
        "id": test_id,
        "user_id": test_id,
        "name": "Test Direct Insert",
        "description": "Testing",
        "created_at": "2026-04-16T20:50:00Z",
        "updated_at": "2026-04-16T20:50:00Z"
    }
    
    response = supabase_admin.table("projects").insert(test_data).execute()
    print(f"✅ Insert successful!")
    print(f"   Response: {response.data}")
except Exception as e:
    print(f"❌ Insert failed: {str(e)}")

# Test 3: Check RLS policies
print("\n3️⃣ Checking RLS policies...")
try:
    # This might fail but let's see what happens
    query = supabase_admin.table("projects").select("*")
    print(f"✅ Query object created")
except Exception as e:
    print(f"❌ Error: {str(e)}")

