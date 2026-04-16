#!/usr/bin/env python3
"""
Check the actual schema of the analyses table in Supabase
"""
import os
from dotenv import load_dotenv
from supabase import create_client, Client
import json

# Load environment variables
load_dotenv('/Users/kavishani/Documents/FYP/arai-system/backend/.env')

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

try:
    # Try to get table info
    response = supabase.table("analyses").select("*").limit(1).execute()
    
    if response.data:
        print("📋 Columns in 'analyses' table:")
        for key in response.data[0].keys():
            print(f"  - {key}")
    else:
        # If table is empty, try a different approach
        print("Table is empty, trying to infer schema...")
        
        # Try querying with specific columns
        try:
            response2 = supabase.rpc("get_table_columns", {"table_name": "analyses"}).execute()
            print(f"RPC response: {response2}")
        except:
            print("RPC not available")
            
except Exception as e:
    print(f"Error: {e}")
    print(f"\nTrying to create a test insert to see all required fields...")
    
    # The error message will tell us what's missing
    test_data = {
        "id": "test-123",
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "design_name": "Test",
        "filename": "test.png",
        "file_path": "/test.png",
        "status": "completed",
        "arai_score": 75.5,
        "overall_grade": "A",
        "conformance_level": "WCAG 2.1 AA",
        "accessibility_score": 75.0,
        "readability_score": 80.0,
        "attention_score": 70.0,
        "created_at": "2026-04-16T18:52:31.497748",
        "updated_at": "2026-04-16T18:52:31.497758"
    }
    
    try:
        response = supabase.table("analyses").insert(test_data).execute()
        print("✅ Insert succeeded without 'results' column!")
        print(f"Response: {response}")
    except Exception as e2:
        print(f"❌ Error: {e2}")
