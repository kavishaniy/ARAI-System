#!/usr/bin/env python3
"""
Get the actual schema of the analyses table
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

# Try with all the fields we know about
test_data = {
    "id": str(uuid.uuid4()),
    "user_id": str(uuid.uuid4()),
    "design_name": "Test Design",
    "design_url": "https://example.com/test.png",  
    "accessibility_score": 75.0,
    "readability_score": 80.0,
    "attention_score": 70.0,
    "arai_score": 75.5,
    "overall_score": 75.5,  # This is also required!
    "overall_grade": "A",
    "status": "completed",
}

print("🔍 Testing with all expected fields...")
try:
    response = supabase.table("analyses").insert(test_data).execute()
    print(f"✅ Insert succeeded!")
    print(f"   Inserted record: {response.data[0] if response.data else 'No response data'}")
    print(f"\n✅ Actual table columns that exist:")
    if response.data:
        for key in response.data[0].keys():
            print(f"   - {key}")
except Exception as e:
    error_msg = str(e)
    if "null value" in error_msg:
        # Extract column name from error
        import re
        match = re.search(r'null value in column "([^"]+)"', error_msg)
        if match:
            missing_col = match.group(1)
            print(f"❌ Missing required column: '{missing_col}'")
    print(f"   Error: {error_msg[:200]}")
