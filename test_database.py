#!/usr/bin/env python3
"""
Test script to verify Supabase connection and database schema
"""
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv('/Users/kavishani/Documents/FYP/arai-system/backend/.env')

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

print("🔍 Supabase Connection Test")
print("=" * 60)

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ ERROR: Supabase credentials not found in .env file")
    exit(1)

print(f"✅ Found Supabase URL: {SUPABASE_URL[:50]}...")
print(f"✅ Found Service Key: {SUPABASE_SERVICE_KEY[:50]}...")

try:
    # Create client
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    print("\n✅ Supabase client created successfully")
    
    # Test connection by querying the analyses table
    print("\n📋 Checking 'analyses' table...")
    response = supabase.table("analyses").select("*").limit(1).execute()
    print(f"✅ Table 'analyses' exists")
    print(f"   Columns: {list(response.data[0].keys()) if response.data else 'N/A (table empty)'}")
    
    # Get all records
    all_response = supabase.table("analyses").select("*").execute()
    print(f"✅ Total records in 'analyses' table: {len(all_response.data)}")
    
    if all_response.data:
        print("\n📊 Recent analyses:")
        for analysis in all_response.data[-5:]:  # Last 5
            print(f"  - {analysis.get('design_name', 'N/A')} | Score: {analysis.get('arai_score', 'N/A')} | Created: {analysis.get('created_at', 'N/A')}")
    
    print("\n✅ Database connection test PASSED")
    
except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    print(f"\nDetails: {type(e).__name__}")
    import traceback
    traceback.print_exc()
