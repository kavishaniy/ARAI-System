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


# Project Models
class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)


class Project(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    description: Optional[str]
    analysis_count: Optional[int] = 0
    created_at: datetime
    updated_at: Optional[datetime]


class ProjectList(BaseModel):
    projects: list[Project]
    total: int


# Team Models
class TeamCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)


class TeamMember(BaseModel):
    id: UUID
    user_id: UUID
    email: str
    role: str = Field(..., pattern="^(owner|admin|editor|member|viewer)$")
    joined_at: datetime


class Team(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    created_by: UUID
    members: Optional[list[TeamMember]] = []
    created_at: datetime
    updated_at: Optional[datetime]


class TeamList(BaseModel):
    teams: list[Team]
    total: int


# Project Sharing Models
class ProjectShareCreate(BaseModel):
    team_id: Optional[UUID] = None
    user_id: Optional[UUID] = None
    access_level: str = Field("viewer", pattern="^(owner|editor|viewer)$")


class ProjectShare(BaseModel):
    id: UUID
    project_id: UUID
    team_id: Optional[UUID]
    user_id: Optional[UUID]
    access_level: str
    shared_by: UUID
    shared_at: datetime


class ProjectWithShares(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    description: Optional[str]
    access_level: str = "owner"  # Current user's access level
    shares: list[ProjectShare] = []
    analysis_count: Optional[int] = 0
    created_at: datetime
    updated_at: Optional[datetime]


class ShareProject(BaseModel):
    project_id: UUID
    team_ids: Optional[list[UUID]] = []
    user_emails: Optional[list[str]] = []
    access_level: str = Field("viewer", pattern="^(editor|viewer)$")