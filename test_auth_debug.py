#!/usr/bin/env python3
"""
Test authentication and token verification
Run this to debug authentication issues
"""
import os
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

from dotenv import load_dotenv
load_dotenv(backend_path / ".env")

from supabase import create_client

# Get credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

print("=" * 60)
print("🔍 AUTHENTICATION DEBUG TEST")
print("=" * 60)

print(f"\n📋 Configuration:")
print(f"   SUPABASE_URL: {SUPABASE_URL[:30]}..." if SUPABASE_URL else "   ❌ SUPABASE_URL not set")
print(f"   SUPABASE_KEY: {'✅ Set' if SUPABASE_KEY else '❌ Not set'}")
print(f"   SUPABASE_SERVICE_KEY: {'✅ Set' if SUPABASE_SERVICE_KEY else '❌ Not set'}")

if not all([SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_KEY]):
    print("\n❌ ERROR: Missing Supabase credentials in .env file")
    sys.exit(1)

# Create Supabase client
print("\n🔧 Creating Supabase client...")
try:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ Client created successfully")
except Exception as e:
    print(f"❌ Failed to create client: {e}")
    sys.exit(1)

# Test login
print("\n" + "=" * 60)
print("TEST 1: Login and Get Token")
print("=" * 60)

email = input("\n📧 Enter your email: ")
password = input("🔒 Enter your password: ")

try:
    print("\n🔐 Attempting login...")
    auth_response = supabase.auth.sign_in_with_password({
        "email": email,
        "password": password
    })
    
    if auth_response.user:
        print(f"✅ Login successful!")
        print(f"   User ID: {auth_response.user.id}")
        print(f"   Email: {auth_response.user.email}")
        
        if auth_response.session:
            token = auth_response.session.access_token
            print(f"\n🎫 Access Token:")
            print(f"   {token[:50]}...")
            
            # Test 2: Verify token
            print("\n" + "=" * 60)
            print("TEST 2: Verify Token")
            print("=" * 60)
            
            print("\n🔍 Verifying token...")
            user_response = supabase.auth.get_user(token)
            
            if user_response.user:
                print("✅ Token verification successful!")
                print(f"   User ID: {user_response.user.id}")
                print(f"   Email: {user_response.user.email}")
                
                # Test 3: Database access
                print("\n" + "=" * 60)
                print("TEST 3: Database Access")
                print("=" * 60)
                
                print("\n🗄️ Testing database query...")
                supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
                
                # Try to get user's analyses
                result = supabase_admin.table("analyses").select("*").eq("user_id", str(user_response.user.id)).limit(5).execute()
                
                print(f"✅ Database query successful!")
                print(f"   Found {len(result.data)} analyses for this user")
                
                if result.data:
                    print("\n📊 Recent analyses:")
                    for analysis in result.data[:3]:
                        print(f"   - {analysis.get('design_name', 'Unnamed')} (Score: {analysis.get('arai_score', 'N/A')})")
                
                # Final summary
                print("\n" + "=" * 60)
                print("✅ ALL TESTS PASSED!")
                print("=" * 60)
                print("\n✨ Your authentication is working correctly!")
                print(f"\n💡 To use in your app:")
                print(f"   1. Make sure you're logged in")
                print(f"   2. Token should be in localStorage as 'access_token'")
                print(f"   3. Upload should work now!")
                
            else:
                print("❌ Token verification failed - no user returned")
        else:
            print("❌ No session returned from login")
    else:
        print("❌ No user returned from login")
        
except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    print(f"\n🔧 Debug info:")
    print(f"   Error type: {type(e).__name__}")
    if hasattr(e, 'response'):
        print(f"   Response: {e.response}")
    import traceback
    print(f"\n📋 Full traceback:")
    traceback.print_exc()

print("\n" + "=" * 60)
print("🏁 Test complete")
print("=" * 60)
