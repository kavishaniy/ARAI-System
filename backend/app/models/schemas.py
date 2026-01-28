from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID


# User Models
class UserSignup(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class User(BaseModel):
    id: UUID
    email: str
    full_name: Optional[str]
    avatar_url: Optional[str]
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str
    user: User


# Analysis Models
class AnalysisRequest(BaseModel):
    design_name: str
    design_url: str


class AccessibilityResult(BaseModel):
    score: float
    issues: list
    recommendations: list
    wcag_compliance: Dict[str, Any]


class ReadabilityResult(BaseModel):
    score: float
    metrics: Dict[str, float]
    issues: list
    recommendations: list


class AttentionResult(BaseModel):
    score: float
    heatmap_url: str
    attention_areas: list
    recommendations: list


class AnalysisResponse(BaseModel):
    id: UUID
    design_name: str
    design_url: str
    
    # Scores
    accessibility_score: float
    readability_score: float
    attention_score: float
    overall_score: float
    
    # Details
    accessibility_details: AccessibilityResult
    readability_details: ReadabilityResult
    attention_details: AttentionResult
    
    # Metadata
    processing_time: float
    created_at: datetime


class AnalysisHistory(BaseModel):
    id: UUID
    design_name: str
    overall_score: float
    created_at: datetime