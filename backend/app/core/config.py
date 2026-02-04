from pydantic_settings import BaseSettings
from typing import Optional
import os
from pathlib import Path

# Get the backend directory path
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BACKEND_DIR / ".env"


class Settings(BaseSettings):
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "ARAI - AI-Powered UX Design Critique"
    VERSION: str = "1.0.0"
    
    # CORS
    ALLOWED_ORIGINS: Optional[str] = None
    
    @property
    def BACKEND_CORS_ORIGINS(self) -> list:
        """Parse ALLOWED_ORIGINS from comma-separated string"""
        origins = [
            "http://localhost:3000",
            "http://localhost:5173",
            "https://*.onrender.com",  # Render deployments
        ]
        # Add origins from environment variable
        if self.ALLOWED_ORIGINS:
            env_origins = [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
            origins.extend(env_origins)
        
        # For production, allow all origins temporarily (remove after testing)
        if self.ENVIRONMENT == "production":
            origins.append("*")
        
        return list(set(origins))  # Remove duplicates
    
    # Supabase
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_SERVICE_KEY: str
    
    # JWT
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # File Upload
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: set = {".jpg", ".jpeg", ".png"}
    
    # AI Models
    SALIENCY_MODEL_PATH: str = "ai_models/saliency_model.pth"
    SALICON_MODEL_PATH: str = "./ai_models/salicon_model"
    RICO_MODEL_PATH: str = "./ai_models/rico_model"
    
    class Config:
        env_file = str(ENV_FILE)
        case_sensitive = True
        extra = "ignore"


settings = Settings()