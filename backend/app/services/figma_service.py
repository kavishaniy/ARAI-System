"""
Figma Analysis Service
Integrates Figma extraction with accessibility, readability, and attention analyzers.
"""

import logging
import uuid
import time
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import math

from app.core.figma_client import FigmaExtractor, FigmaNode
from app.models.figma_models import (
    FigmaAnalysisStatus, FigmaAnalysisResponse, PageAnalysisResult,
    FrameAnalysisResult, AccessibilityScore, ReadabilityScore, AttentionScore,
    ElementBounds, UIElement, TextStyleData
)

logger = logging.getLogger(__name__)


class ContrastRatioAnalyzer:
    """
    Calculate WCAG contrast ratios between colors.
    Implements WCAG 2.1 contrast ratio calculation.
    """
    
    @staticmethod
    def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
        """Convert hex color to RGB"""
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    
    @staticmethod
    def get_luminance(rgb: Tuple[int, int, int]) -> float:
        """Calculate relative luminance (WCAG formula)"""
        r, g, b = [x / 255.0 for x in rgb]
        
        def adjust(c):
            if c <= 0.03928:
                return c / 12.92
            return ((c + 0.055) / 1.055) ** 2.4
        
        r = adjust(r)
        g = adjust(g)
        b = adjust(b)
        
        return 0.2126 * r + 0.7152 * g + 0.0722 * b
    
    @staticmethod
    def calculate_contrast_ratio(color1: str, color2: str) -> float:
        """
        Calculate contrast ratio between two colors.
        Returns value between 1 (no contrast) and 21 (maximum contrast).
        """
        try:
            rgb1 = ContrastRatioAnalyzer.hex_to_rgb(color1)
            rgb2 = ContrastRatioAnalyzer.hex_to_rgb(color2)
            
            l1 = ContrastRatioAnalyzer.get_luminance(rgb1)
            l2 = ContrastRatioAnalyzer.get_luminance(rgb2)
            
            lighter = max(l1, l2)
            darker = min(l1, l2)
            
            return (lighter + 0.05) / (darker + 0.05)
        except Exception as e:
            logger.warning(f"Failed to calculate contrast ratio: {e}")
            return 0
    
    @staticmethod
    def get_wcag_level(contrast_ratio: float) -> str:
        """Determine WCAG level from contrast ratio"""
        if contrast_ratio >= 7:
            return "AAA"
        elif contrast_ratio >= 4.5:
            return "AA"
        elif contrast_ratio >= 3:
            return "A"
        else:
            return "FAIL"


class FigmaAccessibilityAnalyzer:
    """Analyze accessibility aspects of Figma designs"""
    
    MIN_FONT_SIZE = 12  # pixels
    MIN_CONTRAST_RATIO = 4.5  # WCAG AA
    
    def __init__(self):
        self.contrast_analyzer = ContrastRatioAnalyzer()
    
    def analyze_frame(self, elements: List[UIElement]) -> AccessibilityScore:
        """
        Analyze accessibility for a frame.
        
        Checks:
        - Color contrast ratios
        - Font sizes
        - Element visibility
        """
        issues = []
        contrast_issues = []
        font_size_issues = []
        contrast_ratios = []
        
        for elem in elements:
            # Skip non-text elements
            if elem.type != "TEXT" or not elem.text:
                continue
            
            # Check font size
            if elem.text_style and elem.text_style.font_size:
                if elem.text_style.font_size < self.MIN_FONT_SIZE:
                    font_size_issues.append(
                        f"Text '{elem.name}' has font size {elem.text_style.font_size}px, "
                        f"minimum recommended is {self.MIN_FONT_SIZE}px"
                    )
            
            # Check contrast ratio
            if elem.text_color and elem.background_color:
                ratio = self.contrast_analyzer.calculate_contrast_ratio(
                    elem.text_color, elem.background_color
                )
                contrast_ratios.append(ratio)
                
                if ratio < self.MIN_CONTRAST_RATIO:
                    contrast_issues.append(
                        f"Text '{elem.name}' has contrast ratio {ratio:.2f}:1, "
                        f"minimum is {self.MIN_CONTRAST_RATIO}:1"
                    )
        
        # Calculate score
        total_issues = len(contrast_issues) + len(font_size_issues)
        score = max(0, 100 - (total_issues * 10))
        
        # Average contrast ratio
        avg_contrast = sum(contrast_ratios) / len(contrast_ratios) if contrast_ratios else 0
        wcag_level = self.contrast_analyzer.get_wcag_level(avg_contrast)
        
        # Recommendations
        recommendations = []
        if contrast_issues:
            recommendations.append(f"Fix {len(contrast_issues)} contrast issues for WCAG AA compliance")
        if font_size_issues:
            recommendations.append(f"Increase font size for {len(font_size_issues)} text elements")
        if not recommendations:
            recommendations.append("Excellent accessibility! Keep maintaining high contrast ratios.")
        
        return AccessibilityScore(
            score=score,
            issues_found=total_issues,
            contrast_issues=contrast_issues,
            font_size_issues=font_size_issues,
            color_contrast_ratio=avg_contrast,
            wcag_level=wcag_level,
            recommendations=recommendations
        )


class FigmaReadabilityAnalyzer:
    """Analyze readability aspects of Figma designs"""
    
    OPTIMAL_LINE_HEIGHT = 1.5  # 1.5x font size
    OPTIMAL_LETTER_SPACING = 0.02  # em units
    
    def analyze_frame(self, elements: List[UIElement], bounds: ElementBounds) -> ReadabilityScore:
        """
        Analyze readability for a frame.
        
        Checks:
        - Text density
        - Font sizes and variety
        - Line spacing
        - Visual hierarchy
        """
        text_elements = [e for e in elements if e.type == "TEXT" and e.text]
        
        # Calculate text density
        total_text_area = sum(e.bounds.width * e.bounds.height for e in text_elements)
        frame_area = bounds.width * bounds.height
        text_density = (total_text_area / frame_area * 100) if frame_area > 0 else 0
        
        # Analyze font sizes
        font_sizes = [
            e.text_style.font_size 
            for e in text_elements 
            if e.text_style and e.text_style.font_size
        ]
        
        avg_font_size = sum(font_sizes) / len(font_sizes) if font_sizes else 0
        
        # Assess font legibility
        if avg_font_size >= 16:
            legibility = "good"
        elif avg_font_size >= 12:
            legibility = "fair"
        else:
            legibility = "poor"
        
        # Check line spacing
        line_spacing_issues = 0
        for elem in text_elements:
            if elem.text_style and elem.text_style.line_height_percent:
                # line_height_percent is in percentage
                ratio = elem.text_style.line_height_percent / 100.0
                if ratio < 1.2:
                    line_spacing_issues += 1
        
        line_spacing_quality = "adequate"
        if line_spacing_issues > len(text_elements) * 0.5:
            line_spacing_quality = "tight"
        elif line_spacing_issues == 0:
            line_spacing_quality = "loose"
        
        # Assess visual hierarchy
        if len(set(font_sizes)) >= 3:
            hierarchy = "clear"
        elif len(set(font_sizes)) >= 2:
            hierarchy = "moderate"
        else:
            hierarchy = "unclear"
        
        # Calculate score
        score = 100
        if text_density > 70:
            score -= 20
        elif text_density > 50:
            score -= 10
        
        if legibility == "poor":
            score -= 20
        elif legibility == "fair":
            score -= 10
        
        if line_spacing_quality == "tight":
            score -= 10
        
        if hierarchy == "unclear":
            score -= 15
        
        score = max(0, min(100, score))
        
        # Recommendations
        recommendations = []
        if text_density > 60:
            recommendations.append("Reduce text density - consider breaking content across multiple screens")
        if legibility == "poor":
            recommendations.append("Increase font size for better readability")
        if line_spacing_quality == "tight":
            recommendations.append("Increase line spacing for improved readability")
        if hierarchy == "unclear":
            recommendations.append("Establish clearer visual hierarchy with varied font sizes")
        if not recommendations:
            recommendations.append("Good readability! Keep up the clear typography.")
        
        return ReadabilityScore(
            score=score,
            text_density=text_density,
            average_font_size=avg_font_size,
            font_legibility=legibility,
            line_spacing_quality=line_spacing_quality,
            hierarchy_quality=hierarchy,
            recommendations=recommendations
        )


class FigmaAttentionAnalyzer:
    """Analyze visual hierarchy and attention aspects"""
    
    def analyze_frame(self, elements: List[UIElement], bounds: ElementBounds) -> AttentionScore:
        """
        Analyze attention and visual hierarchy.
        
        Evaluates:
        - Element prominence (size, color, position)
        - Focal points
        - Visual hierarchy strength
        """
        # Calculate prominence score for each element
        prominence_scores: Dict[str, float] = {}
        max_prominence = 0
        
        for elem in elements:
            score = self._calculate_prominence(elem, bounds)
            prominence_scores[elem.id] = score
            max_prominence = max(max_prominence, score)
        
        # Find focal points (top 20% by prominence)
        sorted_elements = sorted(
            prominence_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        focal_point_count = max(1, len(elements) // 5)
        focal_elements = dict(sorted_elements[:focal_point_count])
        
        # Find primary and secondary focus areas
        primary_focus = None
        secondary_focus = []
        
        element_map = {e.id: e for e in elements}
        
        for elem_id, score in sorted(focal_elements.items(), key=lambda x: x[1], reverse=True):
            elem = element_map.get(elem_id)
            if not elem:
                continue
            
            bounds_dict = ElementBounds(
                x=elem.bounds.x,
                y=elem.bounds.y,
                width=elem.bounds.width,
                height=elem.bounds.height
            )
            
            if primary_focus is None:
                primary_focus = bounds_dict
            else:
                secondary_focus.append(bounds_dict)
        
        # Assess hierarchy strength
        if max_prominence == 0:
            hierarchy_strength = "weak"
        else:
            # Calculate variance in prominence
            avg_prominence = sum(prominence_scores.values()) / len(prominence_scores) if prominence_scores else 0
            variance = sum((s - avg_prominence) ** 2 for s in prominence_scores.values()) / len(prominence_scores) if prominence_scores else 0
            std_dev = math.sqrt(variance)
            
            if std_dev > avg_prominence * 0.5:
                hierarchy_strength = "strong"
            elif std_dev > avg_prominence * 0.2:
                hierarchy_strength = "moderate"
            else:
                hierarchy_strength = "weak"
        
        # Calculate score
        score = 100
        if hierarchy_strength == "weak":
            score -= 40
        elif hierarchy_strength == "moderate":
            score -= 20
        
        if focal_point_count == 0:
            score -= 30
        
        score = max(0, min(100, score))
        
        # Recommendations
        recommendations = []
        if hierarchy_strength == "weak":
            recommendations.append("Strengthen visual hierarchy - make important elements more prominent")
        if focal_point_count < 2:
            recommendations.append("Create clear focal points using size, color, or positioning")
        if not recommendations:
            recommendations.append("Strong visual hierarchy! Users will easily identify key areas.")
        
        return AttentionScore(
            score=score,
            focal_points=focal_point_count,
            visual_hierarchy=hierarchy_strength,
            primary_focus_area=primary_focus,
            secondary_focus_areas=secondary_focus,
            element_prominence=prominence_scores,
            recommendations=recommendations
        )
    
    def _calculate_prominence(self, elem: UIElement, frame_bounds: ElementBounds) -> float:
        """
        Calculate prominence score for an element.
        Factors:
        - Element size (larger = more prominent)
        - Color contrast (higher = more prominent)
        - Position (center = more prominent)
        """
        score = 0.0
        
        # Size prominence (0-40 points)
        elem_area = elem.bounds.width * elem.bounds.height
        frame_area = frame_bounds.width * frame_bounds.height
        size_ratio = min(1.0, elem_area / frame_area * 100) if frame_area > 0 else 0
        score += size_ratio * 40
        
        # Position prominence (0-30 points)
        # Center is most prominent
        center_x = frame_bounds.width / 2
        center_y = frame_bounds.height / 2
        elem_center_x = elem.bounds.x + elem.bounds.width / 2
        elem_center_y = elem.bounds.y + elem.bounds.height / 2
        
        distance = math.sqrt(
            (elem_center_x - center_x) ** 2 + (elem_center_y - center_y) ** 2
        )
        max_distance = math.sqrt(center_x ** 2 + center_y ** 2)
        
        position_prominence = max(0, 30 * (1 - distance / max_distance if max_distance > 0 else 0))
        score += position_prominence
        
        # Color prominence (0-30 points)
        # Unique colors and contrasting backgrounds are more prominent
        if elem.background_color and elem.text_color:
            contrast = ContrastRatioAnalyzer.calculate_contrast_ratio(
                elem.text_color,
                elem.background_color
            )
            color_prominence = min(30, contrast * 3)
            score += color_prominence
        
        return score


class FigmaAnalysisService:
    """
    Main service orchestrating Figma extraction and analysis.
    """
    
    def __init__(self, figma_token: Optional[str] = None):
        self.extractor = FigmaExtractor(figma_token)
        self.accessibility_analyzer = FigmaAccessibilityAnalyzer()
        self.readability_analyzer = FigmaReadabilityAnalyzer()
        self.attention_analyzer = FigmaAttentionAnalyzer()
    
    async def analyze_from_url(
        self,
        figma_url: str,
        analysis_scope: List[str] = None
    ) -> FigmaAnalysisResponse:
        """
        Complete analysis pipeline from Figma URL.
        
        Args:
            figma_url: Full Figma file URL
            analysis_scope: List of analyses to run
            
        Returns:
            FigmaAnalysisResponse with complete results
        """
        analysis_id = str(uuid.uuid4())
        start_time = datetime.utcnow()
        
        if analysis_scope is None:
            analysis_scope = ["accessibility", "readability", "attention"]
        
        try:
            logger.info(f"[{analysis_id}] Starting Figma analysis from URL")
            
            # Extract from Figma
            extracted_data = self.extractor.extract_from_url(figma_url)
            
            # Analyze pages
            page_results = []
            for idx, page_data in enumerate(extracted_data["pages"]):
                page_result = await self._analyze_page(
                    page_data,
                    analysis_scope,
                    analysis_id
                )
                page_results.append(page_result)
                
                # Small delay between page analysis to avoid rate limiting
                # Only wait if there are more pages to process
                if idx < len(extracted_data["pages"]) - 1:
                    time.sleep(0.5)  # 500ms delay between pages
            
            # Calculate overall metrics
            all_accessibility_scores = [
                f.accessibility.score for p in page_results
                for f in p.frame_results
                if f.accessibility
            ]
            all_readability_scores = [
                f.readability.score for p in page_results
                for f in p.frame_results
                if f.readability
            ]
            all_attention_scores = [
                f.attention.score for p in page_results
                for f in p.frame_results
                if f.attention
            ]
            
            completed_at = datetime.utcnow()
            processing_time = (completed_at - start_time).total_seconds()
            
            response = FigmaAnalysisResponse(
                analysis_id=analysis_id,
                file_key=extracted_data["file_key"],
                file_name=extracted_data["file_name"],
                status=FigmaAnalysisStatus.COMPLETED,
                page_results=page_results,
                total_pages=len(page_results),
                total_frames=sum(len(p.frame_results) for p in page_results),
                average_accessibility_score=sum(all_accessibility_scores) / len(all_accessibility_scores) if all_accessibility_scores else None,
                average_readability_score=sum(all_readability_scores) / len(all_readability_scores) if all_readability_scores else None,
                average_attention_score=sum(all_attention_scores) / len(all_attention_scores) if all_attention_scores else None,
                created_at=start_time,
                completed_at=completed_at,
                processing_time_seconds=processing_time
            )
            
            logger.info(f"[{analysis_id}] ✅ Analysis completed in {processing_time:.2f}s")
            return response
        
        except Exception as e:
            logger.error(f"[{analysis_id}] ❌ Analysis failed: {e}")
            raise
    
    async def _analyze_page(
        self,
        page_data: Dict[str, Any],
        analysis_scope: List[str],
        analysis_id: str
    ) -> PageAnalysisResult:
        """Analyze a single page"""
        frame_results = []
        
        for frame_data in page_data["frames"]:
            frame_result = self._analyze_frame(
                frame_data,
                analysis_scope
            )
            frame_results.append(frame_result)
        
        # Calculate page-level metrics
        accessibility_scores = [f.accessibility.score for f in frame_results if f.accessibility]
        readability_scores = [f.readability.score for f in frame_results if f.readability]
        attention_scores = [f.attention.score for f in frame_results if f.attention]
        
        return PageAnalysisResult(
            page_id=page_data["page_id"],
            page_name=page_data["page_name"],
            frame_results=frame_results,
            total_frames=len(frame_results),
            average_accessibility_score=sum(accessibility_scores) / len(accessibility_scores) if accessibility_scores else None,
            average_readability_score=sum(readability_scores) / len(readability_scores) if readability_scores else None,
            average_attention_score=sum(attention_scores) / len(attention_scores) if attention_scores else None
        )
    
    def _analyze_frame(
        self,
        frame_data: Dict[str, Any],
        analysis_scope: List[str]
    ) -> FrameAnalysisResult:
        """Analyze a single frame"""
        # Convert elements
        elements = [
            UIElement(
                id=e["id"],
                name=e["name"],
                type=e["type"],
                bounds=ElementBounds(**e["bounds"]),
                visible=e.get("visible", True),
                opacity=e.get("opacity", 1.0),
                text=e.get("text"),
                text_style=TextStyleData(**e["text_style"]) if e.get("text_style") else None,
                background_color=e.get("background_color"),
                text_color=e.get("text_color")
            )
            for e in frame_data["elements"]
        ]
        
        # Run analyses
        accessibility = None
        readability = None
        attention = None
        
        if "accessibility" in analysis_scope:
            accessibility = self.accessibility_analyzer.analyze_frame(elements)
        
        if "readability" in analysis_scope:
            bounds = ElementBounds(**frame_data["bounds"])
            readability = self.readability_analyzer.analyze_frame(elements, bounds)
        
        if "attention" in analysis_scope:
            bounds = ElementBounds(**frame_data["bounds"])
            attention = self.attention_analyzer.analyze_frame(elements, bounds)
        
        # Calculate overall score
        scores = [accessibility.score if accessibility else None, readability.score if readability else None, attention.score if attention else None]
        valid_scores = [s for s in scores if s is not None]
        overall_score = sum(valid_scores) / len(valid_scores) if valid_scores else None
        
        return FrameAnalysisResult(
            frame_id=frame_data["frame_id"],
            frame_name=frame_data["frame_name"],
            bounds=ElementBounds(**frame_data["bounds"]),
            elements=elements,
            accessibility=accessibility,
            readability=readability,
            attention=attention,
            overall_score=overall_score
        )
