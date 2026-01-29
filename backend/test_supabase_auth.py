#!/usr/bin/env python3
"""
Test Supabase authentication
"""
import os
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ ERROR: Missing SUPABASE_URL or SUPABASE_KEY in .env file")
    exit(1)

print("=" * 60)
print("🧪 TESTING SUPABASE AUTHENTICATION")
print("=" * 60)
print(f"📍 Supabase URL: {SUPABASE_URL}")
print(f"🔑 Supabase Key: {SUPABASE_KEY[:20]}...")
print()

# Initialize Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Test credentials
TEST_EMAIL = "testuser@gmail.com"
TEST_PASSWORD = "TestPassword123!"

print(f"📧 Test Email: {TEST_EMAIL}")
print(f"🔐 Test Password: {TEST_PASSWORD}")
print()

# Try to sign up
print("🔄 Attempting to sign up...")
try:
    signup_response = supabase.auth.sign_up({
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
        "options": {
            "data": {
                "full_name": "Test User"
            }
        }
    })
    print(f"✅ Signup successful!")
    print(f"   User ID: {signup_response.user.id if signup_response.user else 'None'}")
    print(f"   Email: {signup_response.user.email if signup_response.user else 'None'}")
    print(f"   Session: {'Yes' if signup_response.session else 'No'}")
except Exception as e:
    print(f"⚠️  Signup failed (user might already exist): {e}")

print()

# Try to login
print("🔄 Attempting to login...")
try:
    login_response = supabase.auth.sign_in_with_password({
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    print(f"✅ Login successful!")
    print(f"   User ID: {login_response.user.id}")
    print(f"   Email: {login_response.user.email}")
    print(f"   Access Token: {login_response.session.access_token[:30]}...")
except Exception as e:
    print(f"❌ Login failed: {e}")
    print()
    print("📋 Possible reasons:")
    print("   1. Email confirmation required (check Supabase dashboard)")
    print("   2. Incorrect credentials")
    print("   3. Account doesn't exist")
    print()
    print("💡 To fix:")
    print("   1. Go to Supabase Dashboard > Authentication > Providers > Email")
    print("   2. Disable 'Confirm email' if you want instant login")
    print("   3. Or check your email for confirmation link")

print()
print("=" * 60)
