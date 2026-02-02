from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from app.core.config import settings
from app.models.schemas import UserSignup, UserLogin, Token, User
from typing import Optional

router = APIRouter()
security = HTTPBearer()

# Initialize Supabase client
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
# Admin client for operations that need elevated privileges
supabase_admin: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


@router.post("/signup", response_model=Token)
async def signup(user_data: UserSignup):
    """Register a new user"""
    try:
        # Sign up user with Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "full_name": user_data.full_name
                }
            }
        })
        
        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Signup failed")
        
        # Try to create profile using admin client to bypass RLS
        try:
            profile_data = {
                "id": str(auth_response.user.id),
                "email": user_data.email,
                "full_name": user_data.full_name
            }
            supabase_admin.table("profiles").insert(profile_data).execute()
        except Exception as profile_error:
            # If profile creation fails, it might already exist or will be created by trigger
            print(f"Profile creation warning: {profile_error}")
        
        # Check if session exists
        if not auth_response.session:
            raise HTTPException(status_code=400, detail="Signup successful but session creation failed. Please login.")
        
        # Return token and user info
        return Token(
            access_token=auth_response.session.access_token,
            token_type="bearer",
            user=User(
                id=auth_response.user.id,
                email=auth_response.user.email,
                full_name=user_data.full_name,
                avatar_url=None,
                created_at=auth_response.user.created_at
            )
        )
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        # Provide more helpful error messages
        if "Email logins are disabled" in error_msg or "logins are disabled" in error_msg:
            raise HTTPException(
                status_code=400,
                detail="Email/password authentication is currently disabled. Please contact the administrator or enable email provider in Supabase Authentication settings."
            )
        elif "already registered" in error_msg.lower() or "already exists" in error_msg.lower():
            raise HTTPException(status_code=400, detail="This email is already registered")
        elif "rate limit" in error_msg.lower() or "email_rate_limit" in error_msg.lower():
            raise HTTPException(
                status_code=429, 
                detail="Email rate limit exceeded. Please wait a few minutes before trying again, or use a different email address."
            )
        elif "email" in error_msg.lower() and "confirm" in error_msg.lower():
            raise HTTPException(
                status_code=400, 
                detail="Please check your email to confirm your account before signing in."
            )
        raise HTTPException(status_code=400, detail=f"Signup failed: {error_msg}")


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    """Login user"""
    try:
        print(f"🔐 Login attempt for: {credentials.email}")
        
        # Sign in with Supabase Auth
        auth_response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        
        print(f"✅ Auth response received: {auth_response}")
        
        if not auth_response.user:
            print("❌ No user in auth response")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        if not auth_response.session:
            print("❌ No session in auth response")
            raise HTTPException(status_code=401, detail="Login failed: No session created")
        
        print(f"✅ User authenticated: {auth_response.user.id}")
        
        # Get user profile
        try:
            profile = supabase.table("profiles").select("*").eq(
                "id", auth_response.user.id
            ).single().execute()
            print(f"✅ Profile fetched: {profile.data}")
        except Exception as profile_error:
            print(f"⚠️ Profile fetch failed: {profile_error}")
            # Continue with minimal user data if profile doesn't exist
            profile = None
        
        return Token(
            access_token=auth_response.session.access_token,
            token_type="bearer",
            user=User(
                id=auth_response.user.id,
                email=auth_response.user.email,
                full_name=profile.data.get("full_name") if profile else credentials.email.split("@")[0],
                avatar_url=profile.data.get("avatar_url") if profile else None,
                created_at=auth_response.user.created_at
            )
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Login error: {type(e).__name__}: {str(e)}")
        error_msg = str(e)
        
        # Provide more specific error messages
        if "Email logins are disabled" in error_msg or "logins are disabled" in error_msg:
            raise HTTPException(
                status_code=401,
                detail="Email/password authentication is currently disabled. Please contact the administrator or enable email provider in Supabase Authentication settings."
            )
        elif "Email not confirmed" in error_msg:
            raise HTTPException(
                status_code=401, 
                detail="Please confirm your email before logging in. Check your inbox for the confirmation link."
            )
        elif "Invalid login credentials" in error_msg or "invalid" in error_msg.lower():
            raise HTTPException(status_code=401, detail="Invalid email or password")
        elif "not confirmed" in error_msg.lower():
            raise HTTPException(status_code=401, detail="Please confirm your email before logging in")
        elif "rate limit" in error_msg.lower():
            raise HTTPException(status_code=429, detail="Too many login attempts. Please try again later.")
        else:
            raise HTTPException(status_code=401, detail=f"Login failed: {error_msg}")


@router.post("/logout")
async def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Logout user"""
    try:
        token = credentials.credentials
        supabase.auth.sign_out()
        return {"message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Get current authenticated user"""
    try:
        token = credentials.credentials
        user = supabase.auth.get_user(token)
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid authentication")
        
        # Get profile
        profile = supabase.table("profiles").select("*").eq(
            "id", user.user.id
        ).single().execute()
        
        return User(
            id=user.user.id,
            email=user.user.email,
            full_name=profile.data.get("full_name"),
            avatar_url=profile.data.get("avatar_url"),
            created_at=user.user.created_at
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid authentication")