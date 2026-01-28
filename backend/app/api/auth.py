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


@router.post("/signup", response_model=Token)
async def signup(user_data: UserSignup):
    """Register a new user"""
    try:
        # Sign up user with Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password
        })
        
        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Signup failed")
        
        # Create profile
        profile_data = {
            "id": auth_response.user.id,
            "email": user_data.email,
            "full_name": user_data.full_name
        }
        supabase.table("profiles").insert(profile_data).execute()
        
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
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    """Login user"""
    try:
        # Sign in with Supabase Auth
        auth_response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        
        if not auth_response.user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Get user profile
        profile = supabase.table("profiles").select("*").eq(
            "id", auth_response.user.id
        ).single().execute()
        
        return Token(
            access_token=auth_response.session.access_token,
            token_type="bearer",
            user=User(
                id=auth_response.user.id,
                email=auth_response.user.email,
                full_name=profile.data.get("full_name"),
                avatar_url=profile.data.get("avatar_url"),
                created_at=auth_response.user.created_at
            )
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")


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