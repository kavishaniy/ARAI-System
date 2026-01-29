#!/usr/bin/env python3
"""
Manually confirm a user's email using Supabase Admin API
"""
import os
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env file")
    exit(1)

# Initialize Supabase admin client
supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print("=" * 60)
print("📧 CONFIRM USER EMAIL")
print("=" * 60)

# Email to confirm
email_to_confirm = input("Enter email to confirm: ").strip()

if not email_to_confirm:
    print("❌ No email provided")
    exit(1)

print(f"\n🔄 Looking up user: {email_to_confirm}")

try:
    # Get user by email using admin API
    response = supabase_admin.auth.admin.list_users()
    
    user_to_confirm = None
    for user in response:
        if user.email == email_to_confirm:
            user_to_confirm = user
            break
    
    if not user_to_confirm:
        print(f"❌ User not found: {email_to_confirm}")
        print("\n💡 Make sure the user has signed up first!")
        exit(1)
    
    print(f"✅ User found!")
    print(f"   ID: {user_to_confirm.id}")
    print(f"   Email: {user_to_confirm.email}")
    print(f"   Email Confirmed: {user_to_confirm.email_confirmed_at is not None}")
    
    if user_to_confirm.email_confirmed_at:
        print(f"\n✅ Email is already confirmed!")
    else:
        print(f"\n🔄 Confirming email...")
        
        # Update user to confirm email
        supabase_admin.auth.admin.update_user_by_id(
            user_to_confirm.id,
            {"email_confirm": True}
        )
        
        print(f"✅ Email confirmed successfully!")
        print(f"\n🎉 User {email_to_confirm} can now log in!")

except Exception as e:
    print(f"❌ Error: {e}")
    print("\n💡 Try disabling email confirmation in Supabase Dashboard instead:")
    print("   1. Go to Authentication > Providers > Email")
    print("   2. Disable 'Confirm email'")
    print("   3. Save changes")

print("\n" + "=" * 60)
