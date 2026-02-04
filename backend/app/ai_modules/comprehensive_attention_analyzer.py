"""
Comprehensive Attention Analyzer
Implements FR-017 to FR-020 requirements

Features:
- FR-017: Saliency-based attention prediction heatmaps
- FR-018: Critical UI element identification and attention priority verification
- FR-019: Visual hierarchy assessment for logical flow
- FR-020: Cognitive load estimation
"""

import torch
import torch.nn as nn
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import torchvision.transforms as transforms
import numpy as np
from typing import Dict, List, Tuple
import cv2
import os


class SaliencyModel(nn.Module):
    """U-Net architecture for saliency prediction"""
    
    def __init__(self):
        super(SaliencyModel, self).__init__()
        
        # Encoder
        self.enc1 = self._conv_block(3, 64)
        self.pool1 = nn.MaxPool2d(2, 2)
        
        self.enc2 = self._conv_block(64, 128)
        self.pool2 = nn.MaxPool2d(2, 2)
        
        self.enc3 = self._conv_block(128, 256)
        self.pool3 = nn.MaxPool2d(2, 2)
        
        # Bottleneck
        self.bottleneck = self._conv_block(256, 512)
        
        # Decoder
        self.upconv3 = nn.ConvTranspose2d(512, 256, 2, stride=2)
        self.dec3 = self._conv_block(512, 256)
        
        self.upconv2 = nn.ConvTranspose2d(256, 128, 2, stride=2)
        self.dec2 = self._conv_block(256, 128)
        
        self.upconv1 = nn.ConvTranspose2d(128, 64, 2, stride=2)
        self.dec1 = self._conv_block(128, 64)
        
        # Output
        self.out = nn.Conv2d(64, 1, 1)
        self.sigmoid = nn.Sigmoid()
    
    def _conv_block(self, in_channels, out_channels):
        return nn.Sequential(
            nn.Conv2d(in_channels, out_channels, 3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, 3, padding=1),
            nn.ReLU(inplace=True)
        )
    
    def forward(self, x):
        # Encoder
        enc1 = self.enc1(x)
        enc2 = self.enc2(self.pool1(enc1))
        enc3 = self.enc3(self.pool2(enc2))
        
        # Bottleneck
        bottleneck = self.bottleneck(self.pool3(enc3))
        
        # Decoder with skip connections
        dec3 = self.upconv3(bottleneck)
        dec3 = torch.cat([dec3, enc3], dim=1)
        dec3 = self.dec3(dec3)
        
        dec2 = self.upconv2(dec3)
        dec2 = torch.cat([dec2, enc2], dim=1)
        dec2 = self.dec2(dec2)
        
        dec1 = self.upconv1(dec2)
        dec1 = torch.cat([dec1, enc1], dim=1)
        dec1 = self.dec1(dec1)
        
        return self.sigmoid(self.out(dec1))


class ComprehensiveAttentionAnalyzer:
    """
    Complete Visual Attention and Cognitive Load Analyzer
    """
    
    def __init__(self, model_path: str):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Load saliency model
        self.model = SaliencyModel().to(self.device)
        if os.path.exists(model_path):
            self.model.load_state_dict(torch.load(model_path, map_location=self.device))
            self.model.eval()
            print(f"✅ Loaded saliency model from {model_path}")
        else:
            print(f"⚠️  Model not found at {model_path}. Using heuristic-based analysis.")
            self.model = None
        
        # Image preprocessing
        self.transform = transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.ToTensor(),
        ])
        
        # Cognitive load thresholds
        self.MAX_ELEMENTS = 7  # Miller's Law: 7±2 items
        self.MAX_COLORS = 5
        self.OPTIMAL_DENSITY = 0.3
    
    def analyze_design(self, image_path: str) -> Dict:
        """
        Complete attention and cognitive load analysis
        """
        image = Image.open(image_path).convert('RGB')
        image_array = np.array(image)
        
        # FR-017: Generate saliency heatmap
        saliency_map, heatmap_overlay = self._generate_saliency_heatmap(image)
        
        # FR-018: Identify critical UI elements
        critical_elements = self._identify_critical_elements(image_array, saliency_map)
        attention_priority_issues = self._verify_attention_priority(critical_elements, saliency_map)
        
        # FR-019: Assess visual hierarchy
        hierarchy_analysis = self._assess_visual_hierarchy(image_array, saliency_map)
        hierarchy_issues = hierarchy_analysis["issues"]
        
        # FR-020: Estimate cognitive load
        cognitive_load_analysis = self._estimate_cognitive_load(image_array, saliency_map)
        cognitive_issues = cognitive_load_analysis["issues"]
        
        # Combine all issues
        all_issues = attention_priority_issues + hierarchy_issues + cognitive_issues
        
        # Calculate score
        score = self._calculate_score(saliency_map, all_issues, cognitive_load_analysis)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(all_issues, cognitive_load_analysis)
        
        return {
            "score": round(score, 2),
            "saliency_heatmap": heatmap_overlay,
            "attention_distribution": self._analyze_attention_distribution(saliency_map),
            "critical_elements": critical_elements,
            "visual_hierarchy": hierarchy_analysis,
            "cognitive_load": cognitive_load_analysis,
            "issues": all_issues,
            "issue_summary": {
                "attention_priority": len(attention_priority_issues),
                "visual_hierarchy": len(hierarchy_issues),
                "cognitive_load": len(cognitive_issues)
            },
            "recommendations": recommendations
        }
    
    def _generate_saliency_heatmap(self, image: Image.Image) -> Tuple[np.ndarray, str]:
        """
        FR-017: Generate saliency-based attention prediction heatmap
        """
        if self.model:
            # Use trained model
            image_tensor = self.transform(image).unsqueeze(0).to(self.device)
            
            with torch.no_grad():
                saliency = self.model(image_tensor)
            
            saliency_map = saliency.squeeze().cpu().numpy()
        else:
            # Use heuristic-based saliency
            saliency_map = self._heuristic_saliency(np.array(image))
        
        # Resize to original image size
        saliency_map = cv2.resize(saliency_map, (image.width, image.height))
        
        # Create heatmap overlay
        heatmap_overlay = self._create_heatmap_overlay(image, saliency_map)
        
        return saliency_map, heatmap_overlay
    
    def _heuristic_saliency(self, image_array: np.ndarray) -> np.ndarray:
        """
        Heuristic saliency using color, contrast, and position
        """
        height, width = image_array.shape[:2]
        
        # Convert to LAB color space for better perceptual analysis
        lab = cv2.cvtColor(image_array, cv2.COLOR_RGB2LAB)
        
        # Calculate local contrast
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY).astype(float)
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        contrast = np.abs(gray - blur)
        
        # Color uniqueness
        mean_color = cv2.blur(image_array.astype(float), (11, 11))
        color_difference = np.sqrt(np.sum((image_array - mean_color) ** 2, axis=2))
        
        # Edge detection
        edges = cv2.Canny(image_array, 50, 150).astype(float)
        
        # Center bias (F-pattern and center attention)
        y, x = np.ogrid[:height, :width]
        center_y, center_x = height // 2, width // 2
        distance = np.sqrt((x - center_x) ** 2 + (y - center_y) ** 2)
        max_distance = np.sqrt(center_x ** 2 + center_y ** 2)
        center_bias = 1 - (distance / max_distance)
        
        # F-pattern bias (top-left has more attention)
        f_pattern = np.zeros((height, width))
        f_pattern[:height//3, :] = 0.8  # Top horizontal
        f_pattern[:, :width//4] = 0.9  # Left vertical
        f_pattern[height//3:2*height//3, :width//2] = 0.6  # Middle horizontal
        
        # Combine features
        saliency = (
            contrast * 0.3 +
            color_difference * 0.2 +
            edges * 0.2 +
            center_bias * 50 * 0.15 +
            f_pattern * 255 * 0.15
        )
        
        # Normalize
        saliency = (saliency - saliency.min()) / (saliency.max() - saliency.min() + 1e-8)
        
        return saliency
    
    def _create_heatmap_overlay(self, image: Image.Image, saliency_map: np.ndarray) -> str:
        """Create visual heatmap overlay"""
        # Normalize saliency map
        saliency_normalized = (saliency_map * 255).astype(np.uint8)
        
        # Apply colormap (jet colormap: blue=low, red=high)
        heatmap = cv2.applyColorMap(saliency_normalized, cv2.COLORMAP_JET)
        heatmap_rgb = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
        
        # Blend with original image
        image_array = np.array(image)
        blended = cv2.addWeighted(image_array, 0.6, heatmap_rgb, 0.4, 0)
        
        # For now, return description (in real implementation, save image)
        return "heatmap_overlay_path"
    
    def _identify_critical_elements(self, image_array: np.ndarray, saliency_map: np.ndarray) -> List[Dict]:
        """
        FR-018: Identify critical UI elements (buttons, CTAs, headers)
        """
        critical_elements = []
        
        # Detect high-contrast regions (likely buttons/CTAs)
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for i, contour in enumerate(contours[:30]):  # Top 30 elements
            x, y, w, h = cv2.boundingRect(contour)
            area = w * h
            
            # Filter for button-sized elements
            if 1000 < area < 50000:
                # Calculate attention received
                element_saliency = saliency_map[y:y+h, x:x+w]
                avg_attention = element_saliency.mean() if element_saliency.size > 0 else 0
                max_attention = element_saliency.max() if element_saliency.size > 0 else 0
                
                # Classify element importance by position and size
                is_top = y < image_array.shape[0] * 0.3
                is_large = area > 10000
                is_centered = abs((x + w/2) - image_array.shape[1]/2) < image_array.shape[1] * 0.2
                
                importance = "high" if (is_top or is_large or is_centered) else "medium"
                
                critical_elements.append({
                    "id": f"element_{i}",
                    "type": self._classify_element_type(w, h, is_top),
                    "location": {"x": int(x), "y": int(y), "width": int(w), "height": int(h)},
                    "importance": importance,
                    "attention_score": round(float(avg_attention), 3),
                    "max_attention": round(float(max_attention), 3),
                    "area": int(area)
                })
        
        # Sort by importance and attention
        critical_elements.sort(key=lambda e: (e["importance"] == "high", e["attention_score"]), reverse=True)
        
        return critical_elements[:10]  # Top 10 critical elements
    
    def _classify_element_type(self, width: int, height: int, is_top: bool) -> str:
        """Classify element type based on dimensions and position"""
        aspect_ratio = width / height if height > 0 else 1
        
        if is_top and width > height * 3:
            return "Header/Navigation"
        elif 2 < aspect_ratio < 5 and height < 60:
            return "Button/CTA"
        elif aspect_ratio < 1.5 and width < 100:
            return "Icon"
        elif aspect_ratio > 3:
            return "Text Block"
        else:
            return "UI Element"
    
    def _verify_attention_priority(self, critical_elements: List[Dict], saliency_map: np.ndarray) -> List[Dict]:
        """
        FR-018: Verify critical elements receive appropriate attention
        """
        issues = []
        
        for element in critical_elements:
            importance = element["importance"]
            attention = element["attention_score"]
            
            # High importance elements should have high attention
            if importance == "high" and attention < 0.5:
                attention_percent = round(attention * 100, 1)
                issues.append({
                    "id": f"attention_priority_{element['id']}",
                    "category": "Attention",
                    "subcategory": "Priority Mismatch",
                    "severity": "high",
                    "type": "Low Attention to Critical Element",
                    "description": f"Critical {element['type']} not receiving enough visual attention",
                    "element": element,
                    "expected_attention": "high",
                    "actual_attention": attention,
                    "confidence": 0.80,
                    "explanation": f"This {element['type']} is important but only receives {attention_percent}% of user attention. Users may miss it.",
                    "fix_suggestion": "Increase visual prominence through size, color, contrast, or position."
                })
            
            # Medium importance with very high attention might be over-emphasized
            elif importance == "medium" and attention > 0.8:
                attention_percent = round(attention * 100, 1)
                issues.append({
                    "id": f"attention_overemphasis_{element['id']}",
                    "category": "Attention",
                    "subcategory": "Over-emphasis",
                    "severity": "low",
                    "type": "Excessive Attention to Secondary Element",
                    "description": f"{element['type']} may be drawing too much attention",
                    "element": element,
                    "expected_attention": "medium",
                    "actual_attention": attention,
                    "confidence": 0.65,
                    "explanation": f"This element receives {attention_percent}% of user attention, which might distract from more important content.",
                    "fix_suggestion": "Consider reducing visual prominence if not a primary action."
                })
        
        return issues
    
    def _assess_visual_hierarchy(self, image_array: np.ndarray, saliency_map: np.ndarray) -> Dict:
        """
        FR-019: Assess visual hierarchy for logical flow
        """
        height, width = image_array.shape[:2]
        
        # Analyze F-pattern compliance
        top_third_attention = saliency_map[:height//3, :].mean()
        middle_attention = saliency_map[height//3:2*height//3, :].mean()
        bottom_attention = saliency_map[2*height//3:, :].mean()
        
        left_attention = saliency_map[:, :width//3].mean()
        center_attention = saliency_map[:, width//3:2*width//3].mean()
        right_attention = saliency_map[:, 2*width//3:].mean()
        
        issues = []
        
        # Check F-pattern (top-left should have highest attention)
        if top_third_attention < bottom_attention:
            issues.append({
                "id": "hierarchy_inverted",
                "category": "Attention",
                "subcategory": "Visual Hierarchy",
                "severity": "medium",
                "type": "Inverted Visual Hierarchy",
                "description": "Bottom of design receives more attention than top",
                "top_attention": round(float(top_third_attention), 3),
                "bottom_attention": round(float(bottom_attention), 3),
                "confidence": 0.75,
                "explanation": "Users typically start at the top. Important content should be placed higher.",
                "fix_suggestion": "Move critical elements to the top third of the design."
            })
        
        # Check left-alignment preference
        if right_attention > left_attention * 1.5:
            issues.append({
                "id": "hierarchy_right_heavy",
                "category": "Attention",
                "subcategory": "Visual Hierarchy",
                "severity": "low",
                "type": "Right-Heavy Layout",
                "description": "Right side receives disproportionate attention",
                "left_attention": round(float(left_attention), 3),
                "right_attention": round(float(right_attention), 3),
                "confidence": 0.70,
                "explanation": "Western reading patterns favor left-to-right flow. Important content should start on the left.",
                "fix_suggestion": "Consider left-aligning primary content and CTAs."
            })
        
        # Check for balanced emphasis
        attention_variance = np.var([top_third_attention, middle_attention, bottom_attention])
        if attention_variance < 0.01:
            issues.append({
                "id": "hierarchy_flat",
                "category": "Attention",
                "subcategory": "Visual Hierarchy",
                "severity": "medium",
                "type": "Flat Visual Hierarchy",
                "description": "Lack of clear visual hierarchy",
                "attention_variance": round(float(attention_variance), 4),
                "confidence": 0.70,
                "explanation": "All areas receive similar attention, making it unclear what's most important.",
                "fix_suggestion": "Create clear hierarchy using size, color, and contrast to emphasize important elements."
            })
        
        return {
            "attention_distribution": {
                "top": round(float(top_third_attention), 3),
                "middle": round(float(middle_attention), 3),
                "bottom": round(float(bottom_attention), 3),
                "left": round(float(left_attention), 3),
                "center": round(float(center_attention), 3),
                "right": round(float(right_attention), 3)
            },
            "f_pattern_compliance": round(float(top_third_attention + left_attention) / 2, 3),
            "hierarchy_clarity": round(float(attention_variance), 4),
            "issues": issues
        }
    
    def _estimate_cognitive_load(self, image_array: np.ndarray, saliency_map: np.ndarray) -> Dict:
        """
        FR-020: Estimate cognitive load based on complexity, density, and information quantity
        """
        height, width = image_array.shape[:2]
        
        # 1. Element complexity (number of distinct elements)
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        element_count = len(contours)
        
        # 2. Color complexity
        colors = image_array.reshape(-1, 3)
        unique_colors = len(np.unique(colors, axis=0))
        dominant_colors = self._count_dominant_colors(image_array)
        
        # 3. Information density
        text_density = self._estimate_text_density(gray)
        visual_density = np.mean(edges > 0)
        
        # 4. Attention fragmentation (how scattered attention is)
        attention_entropy = self._calculate_entropy(saliency_map)
        
        # Calculate cognitive load score
        cognitive_load_score = self._calculate_cognitive_load_score(
            element_count, dominant_colors, visual_density, attention_entropy
        )
        
        issues = []
        
        # Check element count (Miller's Law: 7±2)
        if element_count > 50:
            issues.append({
                "id": "cognitive_too_many_elements",
                "category": "Attention",
                "subcategory": "Cognitive Load",
                "severity": "high",
                "type": "Too Many Elements",
                "description": f"Design contains {element_count} distinct elements",
                "element_count": element_count,
                "recommended_max": 30,
                "confidence": 0.75,
                "explanation": "Too many elements increase cognitive load and make it hard for users to focus.",
                "fix_suggestion": "Simplify design by grouping related elements or removing non-essential items."
            })
        
        # Check color complexity
        if dominant_colors > self.MAX_COLORS:
            issues.append({
                "id": "cognitive_too_many_colors",
                "category": "Attention",
                "subcategory": "Cognitive Load",
                "severity": "medium",
                "type": "Excessive Color Palette",
                "description": f"Design uses {dominant_colors} dominant colors",
                "color_count": dominant_colors,
                "recommended_max": self.MAX_COLORS,
                "confidence": 0.80,
                "explanation": f"Using more than {self.MAX_COLORS} dominant colors can overwhelm users and reduce visual coherence.",
                "fix_suggestion": f"Limit color palette to {self.MAX_COLORS} or fewer dominant colors."
            })
        
        # Check information density
        if visual_density > self.OPTIMAL_DENSITY:
            issues.append({
                "id": "cognitive_high_density",
                "category": "Attention",
                "subcategory": "Cognitive Load",
                "severity": "medium",
                "type": "High Information Density",
                "description": "Design is visually dense with limited white space",
                "density": round(float(visual_density), 3),
                "optimal_max": self.OPTIMAL_DENSITY,
                "confidence": 0.70,
                "explanation": "High density makes designs feel overwhelming and reduces comprehension.",
                "fix_suggestion": "Add more white space and reduce visual clutter."
            })
        
        # Check attention fragmentation
        if attention_entropy > 4.5:
            issues.append({
                "id": "cognitive_fragmented_attention",
                "category": "Attention",
                "subcategory": "Cognitive Load",
                "severity": "medium",
                "type": "Fragmented Attention",
                "description": "Attention is scattered across many areas",
                "entropy": round(float(attention_entropy), 2),
                "confidence": 0.75,
                "explanation": "Scattered attention increases cognitive load and reduces task completion.",
                "fix_suggestion": "Create clear focal points to guide user attention."
            })
        
        return {
            "cognitive_load_score": round(cognitive_load_score, 2),
            "level": self._get_cognitive_load_level(cognitive_load_score),
            "metrics": {
                "element_count": element_count,
                "dominant_colors": dominant_colors,
                "visual_density": round(float(visual_density), 3),
                "attention_entropy": round(float(attention_entropy), 2),
                "text_density": round(float(text_density), 3)
            },
            "issues": issues
        }
    
    def _count_dominant_colors(self, image_array: np.ndarray, threshold: int = 10) -> int:
        """Count dominant colors in image"""
        # Reduce color space for clustering
        pixels = image_array.reshape(-1, 3)
        
        # Simple color quantization
        quantized = (pixels // 32) * 32
        unique_colors = np.unique(quantized, axis=0)
        
        return len(unique_colors)
    
    def _estimate_text_density(self, gray_image: np.ndarray) -> float:
        """Estimate text density (simplified)"""
        # Text tends to have specific characteristics
        _, binary = cv2.threshold(gray_image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        text_pixels = np.sum(binary == 0)
        total_pixels = gray_image.size
        return text_pixels / total_pixels if total_pixels > 0 else 0
    
    def _calculate_entropy(self, saliency_map: np.ndarray) -> float:
        """Calculate entropy of attention distribution"""
        # Normalize to probability distribution
        hist, _ = np.histogram(saliency_map.flatten(), bins=256, range=(0, 1))
        hist = hist / hist.sum()
        
        # Calculate entropy
        entropy = -np.sum(hist * np.log2(hist + 1e-10))
        return entropy
    
    def _calculate_cognitive_load_score(self, element_count: int, colors: int, 
                                       density: float, entropy: float) -> float:
        """Calculate overall cognitive load score (0-100, lower is better)"""
        # Normalize each factor
        element_score = min(100, (element_count / 50) * 100)
        color_score = min(100, (colors / 10) * 100)
        density_score = (density / self.OPTIMAL_DENSITY) * 100
        entropy_score = min(100, (entropy / 6) * 100)
        
        # Weighted average
        cognitive_load = (
            element_score * 0.3 +
            color_score * 0.2 +
            density_score * 0.3 +
            entropy_score * 0.2
        )
        
        return min(100, cognitive_load)
    
    def _get_cognitive_load_level(self, score: float) -> str:
        """Get cognitive load level description"""
        if score < 30:
            return "Low - Easy to process"
        elif score < 50:
            return "Moderate - Manageable complexity"
        elif score < 70:
            return "High - May overwhelm some users"
        else:
            return "Very High - Likely to cause cognitive overload"
    
    def _analyze_attention_distribution(self, saliency_map: np.ndarray) -> Dict:
        """Analyze how attention is distributed"""
        # Find top attention areas
        threshold = np.percentile(saliency_map, 80)
        high_attention_mask = saliency_map > threshold
        high_attention_percentage = np.mean(high_attention_mask) * 100
        
        return {
            "high_attention_percentage": round(float(high_attention_percentage), 2),
            "average_attention": round(float(saliency_map.mean()), 3),
            "max_attention": round(float(saliency_map.max()), 3),
            "attention_concentration": round(float(np.std(saliency_map)), 3)
        }
    
    def _calculate_score(self, saliency_map: np.ndarray, issues: List[Dict], 
                        cognitive_load: Dict) -> float:
        """Calculate overall attention score"""
        base_score = 100
        
        # Deduct based on cognitive load
        cl_score = cognitive_load["cognitive_load_score"]
        base_score -= (cl_score * 0.3)  # 30% weight on cognitive load
        
        # Deduct for issues
        for issue in issues:
            severity = issue.get("severity", "low")
            if severity == "critical":
                base_score -= 10
            elif severity == "high":
                base_score -= 7
            elif severity == "medium":
                base_score -= 4
            elif severity == "low":
                base_score -= 2
        
        return max(0, min(100, base_score))
    
    def _generate_recommendations(self, issues: List[Dict], cognitive_load: Dict) -> List[Dict]:
        """Generate actionable recommendations"""
        recommendations = []
        
        # Group by subcategory
        categories = {}
        for issue in issues:
            cat = issue.get("subcategory", "General")
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(issue)
        
        # Priority mismatch recommendations
        if "Priority Mismatch" in categories:
            recommendations.append({
                "category": "Attention Priority",
                "priority": "high",
                "title": "Emphasize Critical Elements",
                "description": f"Found {len(categories['Priority Mismatch'])} critical elements not receiving enough attention",
                "action": "Increase size, contrast, or use color to make important elements more prominent",
                "impact": "Ensures users notice and interact with key features",
                "resources": ["https://www.nngroup.com/articles/visual-hierarchy/"]
            })
        
        # Visual hierarchy recommendations
        if "Visual Hierarchy" in categories:
            recommendations.append({
                "category": "Visual Hierarchy",
                "priority": "high",
                "title": "Improve Visual Hierarchy",
                "description": "Strengthen visual hierarchy to guide user attention",
                "action": "Use size, color, and positioning to create clear information hierarchy",
                "impact": "Helps users quickly understand content structure and importance",
                "resources": ["https://www.interaction-design.org/literature/article/visual-hierarchy"]
            })
        
        # Cognitive load recommendations
        if "Cognitive Load" in categories:
            cl_level = cognitive_load["level"]
            recommendations.append({
                "category": "Cognitive Load",
                "priority": "high" if "Very High" in cl_level or "High" in cl_level else "medium",
                "title": "Reduce Cognitive Load",
                "description": f"Current cognitive load: {cl_level}",
                "action": "Simplify design by reducing elements, colors, and visual complexity",
                "impact": "Improves user comprehension and task completion rates",
                "resources": [
                    "https://www.nngroup.com/articles/minimize-cognitive-load/",
                    "https://lawsofux.com/millers-law/"
                ]
            })
        
        return recommendations
