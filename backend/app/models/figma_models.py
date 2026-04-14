"""
Data models for Figma design analysis.
Schemas for request/response handling.
"""

from pydantic import BaseModel, Field, HttpUrl, validator
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime


class FigmaAnalysisStatus(str, Enum):
    """Status of a Figma analysis job"""
    PENDING = "pending"
    EXTRACTING = "extracting"
    ANALYZING = "analyzing"
    COMPLETED = "completed"
    FAILED = "failed"


class FigmaRequestModel(BaseModel):
    """Request to analyze a Figma file"""
    figma_url: str = Field(..., description="Full Figma file URL")
    figma_api_token: Optional[str] = Field(
        None, 
        description="Optional personal Figma API token. Uses env var if not provided"
    )
    analysis_scope: Optional[List[str]] = Field(
        default=["accessibility", "readability", "attention"],
        description="Analysis types to run: accessibility, readability, attention"
    )
    
    @validator('figma_url')
    def validate_figma_url(cls, v):
        """Validate Figma URL format"""
        if not v or not ('figma.com' in v and ('file/' in v or 'design/' in v)):
            raise ValueError(
                "Invalid Figma URL. Expected format: "
                "https://www.figma.com/file/FILE_KEY/filename"
            )
        return v


class ElementBounds(BaseModel):
    """Bounding box for an element"""
    x: float
    y: float
    width: float
    height: float
    x2: Optional[float] = None
    y2: Optional[float] = None


class TextStyleData(BaseModel):
    """Text style information"""
    font_family: Optional[str] = None
    font_size: Optional[float] = None
    font_weight: Optional[int] = None
    line_height_percent: Optional[float] = None
    letter_spacing: Optional[float] = None
    text_align: Optional[str] = None
    color: Optional[str] = None  # Hex color


class UIElement(BaseModel):
    """Extracted UI element from Figma"""
    id: str
    name: str
    type: str
    bounds: ElementBounds
    visible: bool = True
    opacity: float = 1.0
    text: Optional[str] = None
    text_style: Optional[TextStyleData] = None
    background_color: Optional[str] = None  # Hex
    text_color: Optional[str] = None  # Hex


class AccessibilityScore(BaseModel):
    """Accessibility analysis results"""
    score: float = Field(..., ge=0, le=100)
    issues_found: int
    contrast_issues: List[str] = []
    font_size_issues: List[str] = []
    color_contrast_ratio: Optional[float] = None
    wcag_level: Optional[str] = None  # A, AA, AAA
    recommendations: List[str] = []


class ReadabilityScore(BaseModel):
    """Readability analysis results"""
    score: float = Field(..., ge=0, le=100)
    text_density: float  # Percentage of screen covered by text
    average_font_size: Optional[float] = None
    font_legibility: str  # good, fair, poor
    line_spacing_quality: str  # adequate, tight, loose
    hierarchy_quality: str  # clear, moderate, unclear
    recommendations: List[str] = []


class AttentionScore(BaseModel):
    """Attention/visual hierarchy analysis results"""
    score: float = Field(..., ge=0, le=100)
    focal_points: int  # Number of clear focal points
    visual_hierarchy: str  # strong, moderate, weak
    primary_focus_area: Optional[ElementBounds] = None
    secondary_focus_areas: List[ElementBounds] = []
    element_prominence: Dict[str, float] = {}  # element_id -> prominence_score
    recommendations: List[str] = []


class FrameAnalysisResult(BaseModel):
    """Complete analysis for a single frame/screen"""
    frame_id: str
    frame_name: str
    bounds: ElementBounds
    elements: List[UIElement]
    
    # Analysis results
    accessibility: Optional[AccessibilityScore] = None
    readability: Optional[ReadabilityScore] = None
    attention: Optional[AttentionScore] = None
    
    # Overall score
    overall_score: Optional[float] = None
    analysis_timestamp: datetime = Field(default_factory=datetime.utcnow)


class PageAnalysisResult(BaseModel):
    """Analysis results for a Figma page"""
    page_id: str
    page_name: str
    frame_results: List[FrameAnalysisResult]
    
    # Summary stats
    total_frames: int
    average_accessibility_score: Optional[float] = None
    average_readability_score: Optional[float] = None
    average_attention_score: Optional[float] = None


class FigmaAnalysisResponse(BaseModel):
    """Complete Figma file analysis response"""
    analysis_id: str
    file_key: str
    file_name: str
    status: FigmaAnalysisStatus
    
    page_results: List[PageAnalysisResult]
    
    # Overall metrics
    total_pages: int
    total_frames: int
    average_accessibility_score: Optional[float] = None
    average_readability_score: Optional[float] = None
    average_attention_score: Optional[float] = None
    
    # Metadata
    created_at: datetime
    completed_at: Optional[datetime] = None
    processing_time_seconds: Optional[float] = None


class FigmaAnalysisDB(BaseModel):
    """Database model for storing analysis results"""
    id: str
    user_id: str
    file_key: str
    file_name: str
    figma_url: str
    
    status: FigmaAnalysisStatus
    analysis_data: Dict[str, Any]  # JSON-serialized FigmaAnalysisResponse
    
    error_message: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    processing_time_seconds: Optional[float] = None


class FigmaFileInfo(BaseModel):
    """Info about a Figma file"""
    file_key: str
    file_name: str
    pages: List[Dict[str, Any]]  # List of pages with frames
    total_frames: int
    created_at: datetime


class AnalysisProgressUpdate(BaseModel):
    """Real-time progress update for analysis"""
    analysis_id: str
    status: FigmaAnalysisStatus
    progress_percent: int = Field(..., ge=0, le=100)
    current_step: str
    message: Optional[str] = None
