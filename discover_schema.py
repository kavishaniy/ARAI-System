#!/usr/bin/env python3
"""
Discover the actual schema of the analyses table by trying different columns
"""
import os
from dotenv import load_dotenv
from supabase import create_client, Client
import uuid

# Load environment variables
load_dotenv('/Users/kavishani/Documents/FYP/arai-system/backend/.env')

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# List of potential column names to test
test_configs = [
    ["id", "user_id"],
    ["id", "user_id", "design_name"],
    ["id", "user_id", "design_name", "filename"],
    ["id", "user_id", "design_name", "filename", "file_path"],
    ["id", "user_id", "design_name", "filename", "file_path", "arai_score"],
    ["id", "user_id", "design_name", "filename", "file_path", "arai_score", "overall_grade"],
    ["id", "user_id", "design_name", "filename", "file_path", "arai_score", "overall_grade", "status"],
]

print("🔍 Discovering 'analyses' table schema...")
print("=" * 60)

for i, cols in enumerate(test_configs, 1):
    test_data = {}
    for col in cols:
        if col == "id":
            test_data[col] = str(uuid.uuid4())
        elif col == "user_id":
            test_data[col] = str(uuid.uuid4())
        elif col == "arai_score":
            test_data[col] = 75.5
        else:
            test_data[col] = f"test_{col}"
    
    try:
        response = supabase.table("analyses").insert(test_data).execute()
        print(f"\n✅ SUCCESS! Columns that work: {cols}")
        print(f"   Data inserted: {test_data}")
        print(f"   Response: {response.data}")
        break
    except Exception as e:
        error_msg = str(e)
        if "Could not find" in error_msg:
            missing = error_msg.split("Could not find the '")[1].split("'")[0]
            print(f"❌ Step {i}: Missing column → '{missing}'")
        else:
            print(f"❌ Step {i}: {error_msg[:100]}")
