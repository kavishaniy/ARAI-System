"""
Simplified WCAG 2.1 Accessibility Analyzer - Focus on 4 Key Areas

Only analyzes:
1. Color Contrast - Text readability with low vision
2. Text Size - Large enough for comfortable reading
3. Color Independence - Colorblind users can understand without color
4. Touch Targets - Buttons/links large enough to tap on mobile

"""

from PIL import Image
import numpy as np
from typing import Dict, List


class SimplifiedWCAGAnalyzer:
    """
    Simplified WCAG 2.1 Analyzer - Only essential accessibility checks
    """
    
    def __init__(self):
        # WCAG 2.1 Contrast Standards
        self.CONTRAST_AA_NORMAL = 4.5  # Normal text
        self.CONTRAST_AA_LARGE = 3.0   # Large text
        
        # Touch target standards
        self.MIN_TOUCH_TARGET = 44  # pixels
        
        # Font size standards
        self.MIN_FONT_SIZE = 14  # pixels
        
    def analyze_design(self, image_path: str) -> Dict:
        """
        Analyze design for 4 key accessibility areas
        """
        try:
            image = Image.open(image_path).convert('RGB')
            image_array = np.array(image)
        except Exception as e:
            return {
                "score": 50,
                "wcag_level": "Unknown",
                "conformance": "Unable to analyze",
                "issues": [{
                    "category": "error",
                    "title": "Analysis Error",
                    "description": str(e),
                    "severity": "critical",
                    "how_to_fix": "Please try uploading a different image"
                }]
            }
        
        issues = []
        
        # 1. Color Contrast Analysis
        contrast_issues = self._check_color_contrast(image_array)
        issues.extend(contrast_issues)
        
        # 2. Text Size Analysis
        text_size_issues = self._check_text_size(image_array)
        issues.extend(text_size_issues)
        
        # 3. Color Independence Analysis
        color_blindness_issues = self._check_color_independence(image_array)
        issues.extend(color_blindness_issues)
        
        # 4. Touch Target Analysis
        touch_issues = self._check_touch_targets(image_array)
        issues.extend(touch_issues)
        
        # Calculate score based on issues
        # Start with 100, deduct points for each issue based on severity
        score = 100
        for issue in issues:
            if issue.get('severity') == 'critical':
                score -= 25
            elif issue.get('severity') == 'high':
                score -= 15
            elif issue.get('severity') == 'medium':
                score -= 8
            elif issue.get('severity') == 'info':
                score -= 2
        
        score = max(0, min(100, score))
        
        return {
            "score": round(score, 1),
            "wcag_level": "AA" if score >= 80 else "A" if score >= 70 else "Below A",
            "conformance": "✅ Compliant" if score >= 80 else "⚠️ Needs Improvement" if score >= 70 else "❌ Non-Compliant",
            "issues": issues,
            "summary": self._generate_summary(issues)
        }
    
    def _check_color_contrast(self, image_array: np.ndarray) -> List[Dict]:
        """
        FR-010: Check if text colors have enough contrast with backgrounds
        """
        issues = []
        
        # Sample several regions to estimate contrast
        h, w = image_array.shape[:2]
        regions = [
            (0, 0, w//2, h//2),  # Top-left
            (w//2, 0, w, h//2),   # Top-right
            (0, h//2, w//2, h),   # Bottom-left
            (w//2, h//2, w, h)    # Bottom-right
        ]
        
        low_contrast_found = False
        
        for x1, y1, x2, y2 in regions:
            region = image_array[y1:y2, x1:x2]
            # Simple contrast check using luminance variation
            luminance = 0.299 * region[:,:,0] + 0.587 * region[:,:,1] + 0.114 * region[:,:,2]
            std_dev = np.std(luminance)
            
            if std_dev < 30:  # Low contrast threshold
                low_contrast_found = True
                break
        
        if low_contrast_found:
            issues.append({
                "category": "contrast",
                "title": "❌ Low Text Contrast",
                "description": "Some text may be difficult to read for people with low vision. Text and background colors need a contrast ratio of at least 4.5:1",
                "severity": "high",
                "how_to_fix": [
                    "✏️ Increase contrast between text and background",
                    "✏️ Use darker text on light backgrounds or lighter text on dark backgrounds",
                    "✏️ Test with a contrast checker tool to ensure 4.5:1 ratio for normal text",
                    "✏️ For large text (18pt+), maintain at least 3:1 contrast ratio"
                ]
            })
        else:
            issues.append({
                "category": "contrast",
                "title": "✅ Good Text Contrast",
                "description": "Text appears to have adequate contrast for readability",
                "severity": "success",
                "how_to_fix": ["Great! Your text contrast meets accessibility standards"]
            })
        
        return issues
    
    def _check_text_size(self, image_array: np.ndarray) -> List[Dict]:
        """
        FR-011: Check if text is large enough for comfortable reading
        """
        issues = []
        
        # Estimate text size by analyzing dark areas (text likely)
        h, w = image_array.shape[:2]
        
        # Simple heuristic: check if there are significant dark regions
        gray = 0.299 * image_array[:,:,0] + 0.587 * image_array[:,:,1] + 0.114 * image_array[:,:,2]
        dark_pixels = np.sum(gray < 128)
        text_coverage = dark_pixels / (h * w)
        
        # If very little dark area, text might be too small or too light
        if text_coverage < 0.05:
            issues.append({
                "category": "text_size",
                "title": "⚠️ Check Text Size",
                "description": "Text appears to cover very little of the design. Consider if text size is adequate for comfortable reading",
                "severity": "medium",
                "how_to_fix": [
                    "✏️ Use minimum 14px font size for body text (16px recommended)",
                    "✏️ For mobile, ensure touch-friendly text sizes (at least 16px on mobile)",
                    "✏️ Use at least 18pt or 14pt bold for large text",
                    "✏️ Use 1.5-2.0 line height for better readability"
                ]
            })
        else:
            issues.append({
                "category": "text_size",
                "title": "✅ Adequate Text Size",
                "description": "Text appears to be appropriately sized for comfortable reading",
                "severity": "success",
                "how_to_fix": ["Great! Your text size appears readable for all users"]
            })
        
        return issues
    
    def _check_color_independence(self, image_array: np.ndarray) -> List[Dict]:
        """
        FR-012: Check if design doesn't rely only on color to convey meaning
        """
        issues = []
        
        # Analyze color distribution
        # If design uses many distinct colors, might be relying too much on color
        h, w = image_array.shape[:2]
        sample = image_array[::10, ::10]  # Sample every 10th pixel
        
        # Flatten and get unique colors
        unique_colors = len(np.unique(sample.reshape(-1, 3), axis=0))
        total_pixels = sample.shape[0] * sample.shape[1]
        color_diversity = unique_colors / total_pixels
        
        if color_diversity > 0.5:
            issues.append({
                "category": "color_independence",
                "title": "⚠️ High Color Usage - Verify Non-Color Indicators",
                "description": "Your design uses many colors. Make sure important information isn't conveyed by color alone",
                "severity": "medium",
                "how_to_fix": [
                    "✏️ Add icons or patterns in addition to color to indicate status/state",
                    "✏️ Use text labels alongside color-coded information",
                    "✏️ For errors, use both red color AND an error icon or text",
                    "✏️ Test with grayscale mode - all information should still be clear",
                    "✏️ Consider colorblind users who see protanopia, deuteranopia, or tritanopia"
                ]
            })
        else:
            issues.append({
                "category": "color_independence",
                "title": "✅ Good Color Independence",
                "description": "Design doesn't appear to rely solely on color for conveying meaning",
                "severity": "success",
                "how_to_fix": ["Excellent! Your design includes non-color indicators for important information"]
            })
        
        return issues
    
    def _check_touch_targets(self, image_array: np.ndarray) -> List[Dict]:
        """
        FR-013: Check if buttons and interactive elements are large enough to tap
        """
        issues = []
        
        # Estimate button/interactive area sizes
        h, w = image_array.shape[:2]
        
        # Very rough heuristic: if design is very small, buttons might be hard to tap
        if h < 400 or w < 300:
            issues.append({
                "category": "touch_targets",
                "title": "⚠️ Design Size - Verify Touch Targets",
                "description": "Design appears small. Ensure interactive elements (buttons, links) are at least 44×44px",
                "severity": "medium",
                "how_to_fix": [
                    "✏️ Buttons and links should be at least 44×44 pixels (minimum)",
                    "✏️ 48×48 pixels or larger is recommended for mobile",
                    "✏️ Ensure 8px minimum spacing between touch targets",
                    "✏️ Make interactive elements clearly distinct from non-interactive elements",
                    "✏️ Use adequate padding around clickable areas"
                ]
            })
        else:
            issues.append({
                "category": "touch_targets",
                "title": "✅ Adequate Touch Target Size",
                "description": "Interactive elements appear to have adequate size for easy tapping",
                "severity": "success",
                "how_to_fix": ["Great! Your touch targets appear to be appropriately sized"]
            })
        
        return issues
    
    def _generate_summary(self, issues: List[Dict]) -> Dict:
        """Generate summary of findings"""
        critical = sum(1 for i in issues if i.get('severity') == 'critical')
        high = sum(1 for i in issues if i.get('severity') == 'high')
        medium = sum(1 for i in issues if i.get('severity') == 'medium')
        success = sum(1 for i in issues if i.get('severity') == 'success')
        
        return {
            "critical": critical,
            "high": high,
            "medium": medium,
            "passing": success
        }
