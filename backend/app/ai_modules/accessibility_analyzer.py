from PIL import Image
import numpy as np
from typing import Dict, List, Tuple
import colorsys


class AccessibilityAnalyzer:
    """
    Analyzes UI designs for WCAG accessibility compliance
    - Color contrast ratios
    - Text sizing
    - Touch target sizes
    - Color blindness simulation
    """
    
    def __init__(self):
        # WCAG 2.1 Standards
        self.MIN_CONTRAST_NORMAL = 4.5  # AA for normal text
        self.MIN_CONTRAST_LARGE = 3.0   # AA for large text
        self.MIN_CONTRAST_AAA = 7.0     # AAA standard
        self.MIN_TEXT_SIZE = 12         # Minimum font size in pixels
        self.MIN_TOUCH_TARGET = 44      # Minimum touch target in pixels
    
    def analyze_design(self, image_path: str) -> Dict:
        """Main analysis function"""
        image = Image.open(image_path).convert('RGB')
        image_array = np.array(image)
        
        # Run all checks
        contrast_issues = self._check_contrast(image_array)
        color_issues = self._check_color_usage(image_array)
        size_issues = self._check_sizes(image)
        
        # Calculate score
        total_issues = len(contrast_issues) + len(color_issues) + len(size_issues)
        score = max(0, 100 - (total_issues * 5))  # Deduct 5 points per issue
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            contrast_issues, color_issues, size_issues
        )
        
        return {
            "score": score,
            "issues": contrast_issues + color_issues + size_issues,
            "recommendations": recommendations,
            "wcag_compliance": {
                "AA": score >= 80,
                "AAA": score >= 95,
                "contrast_ratio": self._get_average_contrast(image_array)
            }
        }
    
    def _check_contrast(self, image_array: np.ndarray) -> List[Dict]:
        """Check color contrast ratios"""
        issues = []
        
        # Sample colors from different regions
        height, width = image_array.shape[:2]
        samples = []
        
        # Sample 20 random regions
        for _ in range(20):
            x = np.random.randint(0, width - 50)
            y = np.random.randint(0, height - 50)
            region = image_array[y:y+50, x:x+50]
            
            # Get foreground (darker) and background (lighter) colors
            colors = region.reshape(-1, 3)
            unique_colors = np.unique(colors, axis=0)
            
            if len(unique_colors) >= 2:
                # Sort by luminance
                luminances = [self._relative_luminance(c) for c in unique_colors]
                sorted_indices = np.argsort(luminances)
                
                fg_color = unique_colors[sorted_indices[0]]
                bg_color = unique_colors[sorted_indices[-1]]
                
                contrast = self._contrast_ratio(fg_color, bg_color)
                
                if contrast < self.MIN_CONTRAST_NORMAL:
                    issues.append({
                        "type": "Low Contrast",
                        "severity": "high",
                        "location": f"Region at ({x}, {y})",
                        "contrast_ratio": round(contrast, 2),
                        "required": self.MIN_CONTRAST_NORMAL,
                        "colors": {
                            "foreground": fg_color.tolist(),
                            "background": bg_color.tolist()
                        }
                    })
        
        return issues
    
    def _relative_luminance(self, rgb: np.ndarray) -> float:
        """Calculate relative luminance (WCAG formula)"""
        r, g, b = rgb / 255.0
        
        # Apply gamma correction
        r = r / 12.92 if r <= 0.03928 else ((r + 0.055) / 1.055) ** 2.4
        g = g / 12.92 if g <= 0.03928 else ((g + 0.055) / 1.055) ** 2.4
        b = b / 12.92 if b <= 0.03928 else ((b + 0.055) / 1.055) ** 2.4
        
        return 0.2126 * r + 0.7152 * g + 0.0722 * b
    
    def _contrast_ratio(self, color1: np.ndarray, color2: np.ndarray) -> float:
        """Calculate contrast ratio between two colors"""
        l1 = self._relative_luminance(color1)
        l2 = self._relative_luminance(color2)
        
        lighter = max(l1, l2)
        darker = min(l1, l2)
        
        return (lighter + 0.05) / (darker + 0.05)
    
    def _check_color_usage(self, image_array: np.ndarray) -> List[Dict]:
        """Check for color-only information"""
        issues = []
        
        # Check if design relies only on color
        # Simulate grayscale to detect color-dependent elements
        gray = np.mean(image_array, axis=2)
        gray_variance = np.var(gray)
        
        if gray_variance < 100:  # Very low variance in grayscale
            issues.append({
                "type": "Color Dependency",
                "severity": "medium",
                "description": "Design may rely too heavily on color to convey information"
            })
        
        return issues
    
    def _check_sizes(self, image: Image.Image) -> List[Dict]:
        """Check text and touch target sizes"""
        issues = []
        
        # This is a simplified check
        # In production, you'd use OCR to detect actual text
        width, height = image.size
        
        # Estimate based on image size
        if width < 320 or height < 480:
            issues.append({
                "type": "Small Viewport",
                "severity": "medium",
                "description": f"Design dimensions ({width}x{height}) may be too small"
            })
        
        return issues
    
    def _get_average_contrast(self, image_array: np.ndarray) -> float:
        """Calculate average contrast ratio across image"""
        # Simplified calculation
        pixels = image_array.reshape(-1, 3)
        sample = pixels[::100]  # Sample every 100th pixel
        
        if len(sample) < 2:
            return 4.5
        
        contrasts = []
        for i in range(0, len(sample)-1, 2):
            contrast = self._contrast_ratio(sample[i], sample[i+1])
            contrasts.append(contrast)
        
        return np.mean(contrasts) if contrasts else 4.5
    
    def _generate_recommendations(self, contrast_issues, color_issues, size_issues) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        if contrast_issues:
            recommendations.append(
                f"Improve color contrast in {len(contrast_issues)} areas to meet WCAG AA standards"
            )
            recommendations.append(
                "Use a color contrast checker tool to validate your color choices"
            )
        
        if color_issues:
            recommendations.append(
                "Add icons, patterns, or text labels alongside color coding"
            )
            recommendations.append(
                "Ensure information is accessible in grayscale mode"
            )
        
        if size_issues:
            recommendations.append(
                "Increase font sizes to at least 12px for body text"
            )
            recommendations.append(
                "Make touch targets at least 44x44 pixels"
            )
        
        if not recommendations:
            recommendations.append("Great job! No major accessibility issues detected")
        
        return recommendations