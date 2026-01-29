"""
Comprehensive WCAG 2.1 Accessibility Analyzer
Implements detailed checks for WCAG conformance levels A, AA, and AAA

Based on Web Content Accessibility Guidelines (WCAG) 2.1
https://www.w3.org/TR/WCAG21/
"""

from PIL import Image, ImageDraw, ImageFont
import numpy as np
from typing import Dict, List, Tuple
import colorsys
import cv2


class WCAGAnalyzer:
    """
    Comprehensive WCAG 2.1 Analyzer
    Covers all four POUR principles: Perceivable, Operable, Understandable, Robust
    """
    
    def __init__(self):
        # WCAG 2.1 Contrast Standards
        self.CONTRAST_AA_NORMAL = 4.5  # For normal text (<18pt or <14pt bold)
        self.CONTRAST_AA_LARGE = 3.0   # For large text (≥18pt or ≥14pt bold)
        self.CONTRAST_AAA_NORMAL = 7.0  # Enhanced contrast
        self.CONTRAST_AAA_LARGE = 4.5   # Enhanced contrast for large text
        
        # Size Standards
        self.MIN_FONT_SIZE = 12  # pixels
        self.MIN_TOUCH_TARGET = 44  # pixels (WCAG 2.5.5)
        self.MIN_SPACING = 8  # pixels between interactive elements
        
        # Color Standards
        self.MIN_COLOR_DIFFERENCE = 500  # Color difference threshold
        
    def analyze_design(self, image_path: str) -> Dict:
        """
        Perform comprehensive WCAG 2.1 analysis
        Returns detailed report with conformance levels
        """
        image = Image.open(image_path).convert('RGB')
        image_array = np.array(image)
        
        # Run all WCAG checks
        issues = []
        
        # 1. Perceivable Checks
        perceivable_issues = self._check_perceivable(image, image_array)
        issues.extend(perceivable_issues)
        
        # 2. Operable Checks
        operable_issues = self._check_operable(image, image_array)
        issues.extend(operable_issues)
        
        # 3. Understandable Checks
        understandable_issues = self._check_understandable(image, image_array)
        issues.extend(understandable_issues)
        
        # 4. Robust Checks (limited for visual analysis)
        robust_issues = self._check_robust(image, image_array)
        issues.extend(robust_issues)
        
        # Calculate conformance levels
        conformance = self._calculate_conformance(issues)
        
        # Calculate score
        score = self._calculate_score(issues, conformance)
        
        # Generate detailed recommendations
        recommendations = self._generate_wcag_recommendations(issues, conformance)
        
        # Create annotated image
        annotated_image = self._create_annotated_image(image, issues)
        
        return {
            "score": score,
            "conformance_level": conformance["level"],
            "conformance_details": conformance,
            "issues": issues,
            "issue_count": {
                "critical": len([i for i in issues if i["severity"] == "critical"]),
                "high": len([i for i in issues if i["severity"] == "high"]),
                "medium": len([i for i in issues if i["severity"] == "medium"]),
                "low": len([i for i in issues if i["severity"] == "low"])
            },
            "recommendations": recommendations,
            "wcag_criteria_status": self._get_criteria_status(issues),
            "annotated_image": annotated_image
        }
    
    def _check_perceivable(self, image: Image.Image, image_array: np.ndarray) -> List[Dict]:
        """
        Principle 1: Perceivable
        Information and user interface components must be presentable to users
        """
        issues = []
        
        # 1.1 Text Alternatives
        # Check if there are sufficient visual cues
        issues.extend(self._check_text_alternatives(image_array))
        
        # 1.3 Adaptable
        # Check visual structure and hierarchy
        issues.extend(self._check_structure(image_array))
        
        # 1.4 Distinguishable (Color Contrast)
        issues.extend(self._check_color_contrast_comprehensive(image_array))
        
        # 1.4.3 Contrast (Minimum) - AA
        issues.extend(self._check_contrast_minimum_aa(image_array))
        
        # 1.4.6 Contrast (Enhanced) - AAA
        issues.extend(self._check_contrast_enhanced_aaa(image_array))
        
        # 1.4.11 Non-text Contrast - AA (Level AA, added in 2.1)
        issues.extend(self._check_non_text_contrast(image_array))
        
        return issues
    
    def _check_operable(self, image: Image.Image, image_array: np.ndarray) -> List[Dict]:
        """
        Principle 2: Operable
        User interface components and navigation must be operable
        """
        issues = []
        
        # 2.1 Keyboard Accessible
        # Visual check for interactive elements
        issues.extend(self._check_interactive_elements(image, image_array))
        
        # 2.4 Navigable
        # Check focus indicators and visual hierarchy
        issues.extend(self._check_focus_indicators(image_array))
        
        # 2.5 Input Modalities (WCAG 2.1)
        # 2.5.5 Target Size
        issues.extend(self._check_target_sizes(image_array))
        
        # 2.5.8 Target Size (Minimum) - AA (WCAG 2.2)
        issues.extend(self._check_minimum_target_size(image_array))
        
        return issues
    
    def _check_understandable(self, image: Image.Image, image_array: np.ndarray) -> List[Dict]:
        """
        Principle 3: Understandable
        Information and the operation of user interface must be understandable
        """
        issues = []
        
        # 3.2 Predictable
        # Check for consistent design patterns
        issues.extend(self._check_consistency(image_array))
        
        # 3.3 Input Assistance
        # Check for visual error indicators and help text
        issues.extend(self._check_visual_feedback(image_array))
        
        return issues
    
    def _check_robust(self, image: Image.Image, image_array: np.ndarray) -> List[Dict]:
        """
        Principle 4: Robust
        Content must be robust enough to be interpreted reliably
        """
        issues = []
        
        # Visual quality checks
        issues.extend(self._check_image_quality(image, image_array))
        
        return issues
    
    # ==================== Detailed Check Methods ====================
    
    def _check_text_alternatives(self, image_array: np.ndarray) -> List[Dict]:
        """WCAG 1.1.1 Non-text Content"""
        issues = []
        
        # Detect if image contains primarily visual content without text
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        edge_ratio = np.sum(edges > 0) / edges.size
        
        if edge_ratio > 0.3:  # High edge density suggests complex visuals
            issues.append({
                "wcag_criterion": "1.1.1",
                "wcag_level": "A",
                "type": "Text Alternatives",
                "severity": "medium",
                "description": "Design contains complex visual elements. Ensure all meaningful images have text alternatives.",
                "recommendation": "Add descriptive alt text for all non-decorative images"
            })
        
        return issues
    
    def _check_structure(self, image_array: np.ndarray) -> List[Dict]:
        """WCAG 1.3.1 Info and Relationships"""
        issues = []
        
        # Analyze layout structure using edge detection
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
        
        # Detect horizontal lines (potential separators)
        horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (40, 1))
        horizontal_lines = cv2.morphologyEx(gray, cv2.MORPH_OPEN, horizontal_kernel)
        
        # Check for clear visual hierarchy
        if np.sum(horizontal_lines > 0) < 100:
            issues.append({
                "wcag_criterion": "1.3.1",
                "wcag_level": "A",
                "type": "Visual Structure",
                "severity": "low",
                "description": "Limited visual structure detected. Consider using clear sections and headings.",
                "recommendation": "Use visual separators and whitespace to create clear content hierarchy"
            })
        
        return issues
    
    def _check_color_contrast_comprehensive(self, image_array: np.ndarray) -> List[Dict]:
        """Comprehensive color contrast analysis"""
        issues = []
        height, width = image_array.shape[:2]
        
        # Sample multiple regions for contrast analysis
        sample_points = 30
        low_contrast_count = 0
        
        for _ in range(sample_points):
            x = np.random.randint(10, width - 60)
            y = np.random.randint(10, height - 60)
            
            # Get a small region
            region = image_array[y:y+50, x:x+50]
            
            # Find foreground and background colors
            colors = region.reshape(-1, 3)
            unique_colors = np.unique(colors, axis=0)
            
            if len(unique_colors) >= 2:
                # Calculate luminance for all unique colors
                luminances = [self._relative_luminance(c) for c in unique_colors]
                
                # Find highest and lowest luminance
                max_lum_idx = np.argmax(luminances)
                min_lum_idx = np.argmin(luminances)
                
                bg_color = unique_colors[max_lum_idx]
                fg_color = unique_colors[min_lum_idx]
                
                contrast = self._contrast_ratio(fg_color, bg_color)
                
                if contrast < self.CONTRAST_AA_NORMAL:
                    low_contrast_count += 1
        
        # If more than 30% of samples have low contrast
        if low_contrast_count > sample_points * 0.3:
            issues.append({
                "wcag_criterion": "1.4.3",
                "wcag_level": "AA",
                "type": "Low Color Contrast",
                "severity": "high",
                "description": f"{low_contrast_count} out of {sample_points} sampled regions have insufficient contrast",
                "recommendation": "Increase color contrast to meet WCAG AA standards (4.5:1 for normal text)"
            })
        
        return issues
    
    def _check_contrast_minimum_aa(self, image_array: np.ndarray) -> List[Dict]:
        """WCAG 1.4.3 Contrast (Minimum) - Level AA"""
        issues = []
        
        # Get dominant color pairs
        color_pairs = self._extract_color_pairs(image_array)
        
        failing_pairs = []
        for fg, bg, location in color_pairs:
            contrast = self._contrast_ratio(fg, bg)
            
            if contrast < self.CONTRAST_AA_NORMAL:
                failing_pairs.append({
                    "foreground": fg.tolist(),
                    "background": bg.tolist(),
                    "contrast_ratio": round(contrast, 2),
                    "required": self.CONTRAST_AA_NORMAL,
                    "location": location
                })
        
        if failing_pairs:
            issues.append({
                "wcag_criterion": "1.4.3",
                "wcag_level": "AA",
                "type": "Contrast Minimum Failure",
                "severity": "high",
                "description": f"Found {len(failing_pairs)} color combinations below AA standard",
                "details": failing_pairs[:5],  # Show first 5
                "recommendation": "Adjust colors to achieve minimum 4.5:1 contrast ratio"
            })
        
        return issues
    
    def _check_contrast_enhanced_aaa(self, image_array: np.ndarray) -> List[Dict]:
        """WCAG 1.4.6 Contrast (Enhanced) - Level AAA"""
        issues = []
        
        color_pairs = self._extract_color_pairs(image_array)
        
        failing_pairs = 0
        for fg, bg, _ in color_pairs:
            contrast = self._contrast_ratio(fg, bg)
            if contrast < self.CONTRAST_AAA_NORMAL:
                failing_pairs += 1
        
        if failing_pairs > 0:
            issues.append({
                "wcag_criterion": "1.4.6",
                "wcag_level": "AAA",
                "type": "Enhanced Contrast",
                "severity": "low",
                "description": f"{failing_pairs} color combinations don't meet AAA enhanced contrast",
                "recommendation": "For AAA compliance, achieve 7:1 contrast ratio for normal text"
            })
        
        return issues
    
    def _check_non_text_contrast(self, image_array: np.ndarray) -> List[Dict]:
        """WCAG 1.4.11 Non-text Contrast - Level AA (WCAG 2.1)"""
        issues = []
        
        # Detect UI components (buttons, borders, icons)
        # Using edge detection as proxy for UI elements
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
        edges = cv2.Canny(gray, 100, 200)
        
        # Find contours (potential UI elements)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        low_contrast_elements = 0
        
        for contour in contours[:20]:  # Check first 20 elements
            x, y, w, h = cv2.boundingRect(contour)
            
            if w > 20 and h > 20:  # Significant element
                # Check contrast of element border vs background
                element_region = image_array[y:y+h, x:x+w]
                
                if element_region.size > 0:
                    # Get edge and center colors
                    border_colors = element_region[0, :].reshape(-1, 3)
                    center_colors = element_region[h//2, :].reshape(-1, 3)
                    
                    if len(border_colors) > 0 and len(center_colors) > 0:
                        border_color = np.mean(border_colors, axis=0)
                        center_color = np.mean(center_colors, axis=0)
                        
                        contrast = self._contrast_ratio(border_color, center_color)
                        
                        if contrast < 3.0:  # WCAG 2.1 requires 3:1 for UI components
                            low_contrast_elements += 1
        
        if low_contrast_elements > 0:
            issues.append({
                "wcag_criterion": "1.4.11",
                "wcag_level": "AA",
                "type": "Non-text Contrast",
                "severity": "medium",
                "description": f"Found {low_contrast_elements} UI components with insufficient contrast",
                "recommendation": "UI components and graphic elements need 3:1 contrast ratio"
            })
        
        return issues
    
    def _check_interactive_elements(self, image: Image.Image, image_array: np.ndarray) -> List[Dict]:
        """WCAG 2.1.1 Keyboard - Check for identifiable interactive elements"""
        issues = []
        
        # Detect button-like elements using color uniformity and borders
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        button_like_elements = 0
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            
            # Button-like dimensions
            if 40 < w < 300 and 20 < h < 80:
                aspect_ratio = w / h
                if 1.5 < aspect_ratio < 6:
                    button_like_elements += 1
        
        if button_like_elements > 5:
            issues.append({
                "wcag_criterion": "2.1.1",
                "wcag_level": "A",
                "type": "Interactive Elements",
                "severity": "medium",
                "description": f"Detected {button_like_elements} potential interactive elements",
                "recommendation": "Ensure all interactive elements are keyboard accessible and clearly focusable"
            })
        
        return issues
    
    def _check_focus_indicators(self, image_array: np.ndarray) -> List[Dict]:
        """WCAG 2.4.7 Focus Visible"""
        issues = []
        
        # Check for visual focus indicators (borders, outlines)
        # This is a heuristic check on static images
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
        edges = cv2.Canny(gray, 100, 200)
        
        edge_density = np.sum(edges > 0) / edges.size
        
        if edge_density < 0.01:  # Very few edges
            issues.append({
                "wcag_criterion": "2.4.7",
                "wcag_level": "AA",
                "type": "Focus Indicators",
                "severity": "medium",
                "description": "Limited visible borders detected. Ensure focus indicators are clearly visible.",
                "recommendation": "Add clear visual focus indicators (2px minimum) for all interactive elements"
            })
        
        return issues
    
    def _check_target_sizes(self, image_array: np.ndarray) -> List[Dict]:
        """WCAG 2.5.5 Target Size - Level AAA"""
        issues = []
        
        # Detect small clickable regions
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        small_targets = 0
        
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            
            # Check if looks like interactive element but too small
            if 10 < w < self.MIN_TOUCH_TARGET and 10 < h < self.MIN_TOUCH_TARGET:
                small_targets += 1
        
        if small_targets > 0:
            issues.append({
                "wcag_criterion": "2.5.5",
                "wcag_level": "AAA",
                "type": "Small Target Size",
                "severity": "medium",
                "description": f"Found {small_targets} potentially small interactive targets",
                "recommendation": f"Make touch/click targets at least {self.MIN_TOUCH_TARGET}x{self.MIN_TOUCH_TARGET}px"
            })
        
        return issues
    
    def _check_minimum_target_size(self, image_array: np.ndarray) -> List[Dict]:
        """WCAG 2.5.8 Target Size (Minimum) - Level AA (WCAG 2.2)"""
        issues = []
        
        # WCAG 2.2 requires minimum 24x24 CSS pixels
        MIN_SIZE_2_2 = 24
        
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        undersized_targets = 0
        
        for contour in contours:
            _, _, w, h = cv2.boundingRect(contour)
            
            if 10 < w < MIN_SIZE_2_2 or 10 < h < MIN_SIZE_2_2:
                undersized_targets += 1
        
        if undersized_targets > 0:
            issues.append({
                "wcag_criterion": "2.5.8",
                "wcag_level": "AA",
                "type": "Minimum Target Size",
                "severity": "high",
                "description": f"Found {undersized_targets} targets below minimum size requirement",
                "recommendation": f"Ensure all targets are at least {MIN_SIZE_2_2}x{MIN_SIZE_2_2}px (WCAG 2.2)"
            })
        
        return issues
    
    def _check_consistency(self, image_array: np.ndarray) -> List[Dict]:
        """WCAG 3.2.4 Consistent Identification"""
        issues = []
        
        # Analyze color consistency across the design
        height, width = image_array.shape[:2]
        
        # Sample colors from different quadrants
        quadrants = [
            image_array[0:height//2, 0:width//2],
            image_array[0:height//2, width//2:],
            image_array[height//2:, 0:width//2],
            image_array[height//2:, width//2:]
        ]
        
        color_variances = []
        for quadrant in quadrants:
            colors = quadrant.reshape(-1, 3)
            variance = np.var(colors, axis=0).mean()
            color_variances.append(variance)
        
        # High variance across quadrants suggests inconsistency
        variance_diff = np.std(color_variances)
        
        if variance_diff > 500:
            issues.append({
                "wcag_criterion": "3.2.4",
                "wcag_level": "AA",
                "type": "Visual Consistency",
                "severity": "low",
                "description": "Color and style consistency varies significantly across the design",
                "recommendation": "Maintain consistent visual patterns for similar elements"
            })
        
        return issues
    
    def _check_visual_feedback(self, image_array: np.ndarray) -> List[Dict]:
        """WCAG 3.3.1 Error Identification"""
        issues = []
        
        # Check for red elements (potential error indicators)
        red_channel = image_array[:, :, 0]
        green_channel = image_array[:, :, 1]
        blue_channel = image_array[:, :, 2]
        
        # Detect red-heavy regions
        red_dominant = (red_channel > 150) & (green_channel < 100) & (blue_channel < 100)
        red_ratio = np.sum(red_dominant) / red_dominant.size
        
        if red_ratio > 0.05:  # More than 5% red
            issues.append({
                "wcag_criterion": "3.3.1",
                "wcag_level": "A",
                "type": "Error Indicators",
                "severity": "low",
                "description": "Design contains red elements (potential error states)",
                "recommendation": "Ensure errors are indicated with text, not just color"
            })
        
        return issues
    
    def _check_image_quality(self, image: Image.Image, image_array: np.ndarray) -> List[Dict]:
        """Check overall image quality and clarity"""
        issues = []
        
        # Check resolution
        width, height = image.size
        total_pixels = width * height
        
        if total_pixels < 300000:  # Less than ~640x480
            issues.append({
                "wcag_criterion": "General",
                "wcag_level": "Best Practice",
                "type": "Low Resolution",
                "severity": "low",
                "description": f"Image resolution ({width}x{height}) is low",
                "recommendation": "Use higher resolution designs for better accessibility"
            })
        
        # Check for blur (using Laplacian variance)
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        if laplacian_var < 100:
            issues.append({
                "wcag_criterion": "General",
                "wcag_level": "Best Practice",
                "type": "Image Clarity",
                "severity": "low",
                "description": "Image appears blurry or low quality",
                "recommendation": "Use sharp, high-quality design assets"
            })
        
        return issues
    
    # ==================== Helper Methods ====================
    
    def _relative_luminance(self, rgb: np.ndarray) -> float:
        """Calculate relative luminance (WCAG formula)"""
        r, g, b = rgb / 255.0
        
        # Apply gamma correction
        r = r / 12.92 if r <= 0.03928 else ((r + 0.055) / 1.055) ** 2.4
        g = g / 12.92 if g <= 0.03928 else ((g + 0.055) / 1.055) ** 2.4
        b = b / 12.92 if b <= 0.03928 else ((b + 0.055) / 1.055) ** 2.4
        
        return 0.2126 * r + 0.7152 * g + 0.0722 * b
    
    def _contrast_ratio(self, color1: np.ndarray, color2: np.ndarray) -> float:
        """Calculate contrast ratio between two colors (WCAG formula)"""
        l1 = self._relative_luminance(color1)
        l2 = self._relative_luminance(color2)
        
        lighter = max(l1, l2)
        darker = min(l1, l2)
        
        return (lighter + 0.05) / (darker + 0.05)
    
    def _extract_color_pairs(self, image_array: np.ndarray, num_samples: int = 25) -> List[Tuple]:
        """Extract foreground-background color pairs from image"""
        height, width = image_array.shape[:2]
        color_pairs = []
        
        for _ in range(num_samples):
            x = np.random.randint(10, width - 60)
            y = np.random.randint(10, height - 60)
            
            region = image_array[y:y+50, x:x+50]
            colors = region.reshape(-1, 3)
            unique_colors = np.unique(colors, axis=0)
            
            if len(unique_colors) >= 2:
                luminances = [self._relative_luminance(c) for c in unique_colors]
                sorted_indices = np.argsort(luminances)
                
                fg_color = unique_colors[sorted_indices[0]]
                bg_color = unique_colors[sorted_indices[-1]]
                
                color_pairs.append((fg_color, bg_color, (x, y)))
        
        return color_pairs
    
    def _calculate_conformance(self, issues: List[Dict]) -> Dict:
        """
        Calculate WCAG conformance level (A, AA, AAA)
        """
        level_a_failures = [i for i in issues if i.get("wcag_level") == "A"]
        level_aa_failures = [i for i in issues if i.get("wcag_level") == "AA"]
        level_aaa_failures = [i for i in issues if i.get("wcag_level") == "AAA"]
        
        # Determine conformance level
        if len(level_a_failures) > 0:
            level = "Non-conformant"
        elif len(level_aa_failures) > 0:
            level = "Level A"
        elif len(level_aaa_failures) > 0:
            level = "Level AA"
        else:
            level = "Level AAA"
        
        return {
            "level": level,
            "a_failures": len(level_a_failures),
            "aa_failures": len(level_aa_failures),
            "aaa_failures": len(level_aaa_failures),
            "passes_a": len(level_a_failures) == 0,
            "passes_aa": len(level_a_failures) == 0 and len(level_aa_failures) == 0,
            "passes_aaa": len(issues) == 0
        }
    
    def _calculate_score(self, issues: List[Dict], conformance: Dict) -> float:
        """Calculate accessibility score (0-100)"""
        # Base score on conformance level
        base_scores = {
            "Level AAA": 100,
            "Level AA": 90,
            "Level A": 75,
            "Non-conformant": 50
        }
        
        score = base_scores.get(conformance["level"], 50)
        
        # Deduct for critical and high severity issues
        critical_deduction = len([i for i in issues if i["severity"] == "critical"]) * 10
        high_deduction = len([i for i in issues if i["severity"] == "high"]) * 5
        medium_deduction = len([i for i in issues if i["severity"] == "medium"]) * 2
        
        score = max(0, score - critical_deduction - high_deduction - medium_deduction)
        
        return round(score, 2)
    
    def _generate_wcag_recommendations(self, issues: List[Dict], conformance: Dict) -> List[str]:
        """Generate prioritized recommendations"""
        recommendations = []
        
        # Group recommendations by criterion
        criterion_groups = {}
        for issue in issues:
            criterion = issue.get("wcag_criterion", "General")
            if criterion not in criterion_groups:
                criterion_groups[criterion] = []
            criterion_groups[criterion].append(issue)
        
        # Add high-priority recommendations first
        critical_issues = [i for i in issues if i["severity"] == "critical"]
        if critical_issues:
            recommendations.append(f"🚨 CRITICAL: Fix {len(critical_issues)} critical accessibility issues immediately")
        
        high_issues = [i for i in issues if i["severity"] == "high"]
        if high_issues:
            recommendations.append(f"⚠️ HIGH PRIORITY: Address {len(high_issues)} high-severity issues")
        
        # Specific recommendations
        if conformance["a_failures"] > 0:
            recommendations.append("❌ Design does not meet WCAG Level A (minimum legal requirement)")
            recommendations.append("Focus on fixing Level A issues first")
        elif conformance["aa_failures"] > 0:
            recommendations.append("✓ Passes Level A, but fails Level AA")
            recommendations.append("Address contrast and target size issues to reach AA compliance")
        elif conformance["aaa_failures"] > 0:
            recommendations.append("✓✓ Passes Level AA (industry standard)")
            recommendations.append("Consider enhanced contrast for AAA compliance")
        else:
            recommendations.append("✓✓✓ Excellent! Design meets WCAG Level AAA")
        
        # Add specific criterion recommendations
        for criterion, criterion_issues in criterion_groups.items():
            if criterion != "General" and len(criterion_issues) > 0:
                rec = criterion_issues[0].get("recommendation")
                if rec and rec not in recommendations:
                    recommendations.append(f"[{criterion}] {rec}")
        
        return recommendations
    
    def _get_criteria_status(self, issues: List[Dict]) -> Dict:
        """Get pass/fail status for each WCAG criterion"""
        criteria_status = {}
        
        for issue in issues:
            criterion = issue.get("wcag_criterion")
            if criterion and criterion != "General":
                if criterion not in criteria_status:
                    criteria_status[criterion] = {
                        "status": "fail",
                        "level": issue.get("wcag_level"),
                        "issues": []
                    }
                criteria_status[criterion]["issues"].append({
                    "type": issue["type"],
                    "severity": issue["severity"],
                    "description": issue["description"]
                })
        
        return criteria_status
    
    def _create_annotated_image(self, image: Image.Image, issues: List[Dict]) -> str:
        """Create annotated image highlighting issues"""
        # For now, return placeholder
        # In full implementation, draw boxes and labels on image
        return "annotated_image_placeholder.png"
