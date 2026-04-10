"""
Simplified Attention Analyzer - Focus on 4 Key Areas

Only analyzes:
1. Visual Hierarchy - Does design guide users to important content first?
2. Eye Flow Pattern - How naturally do users' eyes move?
3. Cognitive Load - Is there too much competing for attention?
4. Hot Spots - Which areas naturally attract attention?

"""

from PIL import Image
import numpy as np
from typing import Dict, List


class SimplifiedAttentionAnalyzer:
    """
    Simplified Attention Analyzer - Only essential visual design checks
    """
    
    def __init__(self):
        pass
    
    def analyze_design(self, image_path: str) -> Dict:
        """
        Analyze design for visual attention and focus
        """
        try:
            image = Image.open(image_path).convert('RGB')
            image_array = np.array(image)
        except Exception as e:
            return {
                "score": 50,
                "grade": "Unknown",
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
        
        # 1. Visual Hierarchy Analysis
        hierarchy_issues = self._check_visual_hierarchy(image_array)
        issues.extend(hierarchy_issues)
        
        # 2. Eye Flow Pattern Analysis
        eye_flow_issues = self._check_eye_flow_pattern(image_array)
        issues.extend(eye_flow_issues)
        
        # 3. Cognitive Load Analysis
        cognitive_issues = self._check_cognitive_load(image_array)
        issues.extend(cognitive_issues)
        
        # 4. Hot Spots Analysis
        hot_spot_issues = self._check_hot_spots(image_array)
        issues.extend(hot_spot_issues)
        
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
            "grade": "A" if score >= 80 else "B" if score >= 70 else "C" if score >= 60 else "D",
            "conformance": "✅ Excellent" if score >= 80 else "⚠️ Good" if score >= 70 else "❌ Needs Work",
            "issues": issues,
            "summary": self._generate_summary(issues)
        }
    
    def _check_visual_hierarchy(self, image_array: np.ndarray) -> List[Dict]:
        """
        FR-018: Check if visual hierarchy guides user attention appropriately
        """
        issues = []
        
        h, w = image_array.shape[:2]
        
        # Analyze for clear size and color variations indicating hierarchy
        # Sample different regions for contrast/variation
        top_region = image_array[0:h//4, :]
        bottom_region = image_array[3*h//4:h, :]
        
        top_brightness = np.mean(top_region)
        bottom_brightness = np.mean(bottom_region)
        
        brightness_diff = abs(top_brightness - bottom_brightness)
        
        if brightness_diff < 20:
            issues.append({
                "category": "visual_hierarchy",
                "title": "⚠️ Visual Hierarchy Unclear",
                "description": "Different sections appear to have similar visual weight. Users may not know where to focus first",
                "severity": "high",
                "how_to_fix": [
                    "✏️ Use size to create hierarchy: Important elements larger, secondary elements smaller",
                    "✏️ Use contrast: Important content should stand out with bolder colors or darker text",
                    "✏️ Use whitespace: Separate important sections with breathing room",
                    "✏️ Use color: Draw attention with color, but not overuse it",
                    "✏️ Primary content should be ~60% of the visual space",
                    "✏️ Secondary content ~30%, supporting ~10%",
                    "✏️ Make the call-to-action (CTA) the most prominent element"
                ]
            })
        
        return issues
    
    def _check_eye_flow_pattern(self, image_array: np.ndarray) -> List[Dict]:
        """
        FR-019: Check if eye flow follows natural reading patterns
        """
        issues = []
        
        h, w = image_array.shape[:2]
        
        # Analyze edges and corners - where people's eyes naturally travel
        top_left = image_array[0:h//4, 0:w//4]
        top_center = image_array[0:h//4, w//4:3*w//4]
        bottom_right = image_array[3*h//4:h, 3*w//4:w]
        
        # Calculate visual weight in key areas
        tl_weight = np.mean(top_left)
        tc_weight = np.mean(top_center)
        br_weight = np.mean(bottom_right)
        
        # Check if there's a natural Z or F pattern (reading pattern)
        pattern_score = abs(tl_weight - tc_weight) + abs(tc_weight - br_weight)
        
        if pattern_score < 30:
            issues.append({
                "category": "eye_flow",
                "title": "⚠️ Eye Flow Pattern Unclear",
                "description": "Design may not follow natural eye movement patterns (Z or F pattern for left-to-right readers)",
                "severity": "medium",
                "how_to_fix": [
                    "✏️ Follow the Z-pattern: Top-left → Top-right → Bottom-left → Bottom-right",
                    "✏️ Follow the F-pattern: For text-heavy designs (heading, subheading, body)",
                    "✏️ Place important info at the top and left side where eyes naturally start",
                    "✏️ Navigation should be easy to find (top or left side)",
                    "✏️ Call-to-action should be at the bottom of the 'Z' or 'F'",
                    "✏️ Use visual elements (arrows, lines) to guide eye movement",
                    "✏️ Ensure flow matches user expectations and reading direction"
                ]
            })
        
        return issues
    
    def _check_cognitive_load(self, image_array: np.ndarray) -> List[Dict]:
        """
        FR-020: Check if there's too much visual information competing for attention
        """
        issues = []
        
        h, w = image_array.shape[:2]
        
        # Analyze color diversity and edges (high complexity = cognitive load)
        sample = image_array[::5, ::5]  # Sample every 5th pixel
        
        # Count unique colors as a proxy for complexity
        unique_colors = len(np.unique(sample.reshape(-1, 3), axis=0))
        total_pixels = sample.shape[0] * sample.shape[1]
        color_diversity = (unique_colors / total_pixels) * 100
        
        # Detect edges for complexity
        edges_estimate = np.std(image_array)
        
        # High complexity score indicates potential cognitive overload
        complexity_score = (color_diversity * 0.4) + (edges_estimate / 2.55 * 0.6)
        
        if complexity_score > 50:
            issues.append({
                "category": "cognitive_load",
                "title": "⚠️ High Cognitive Load",
                "description": "Design has many competing visual elements. Reduce complexity to help users focus",
                "severity": "high",
                "how_to_fix": [
                    "✏️ Limit color palette to 3-5 main colors (+ neutrals)",
                    "✏️ Use whitespace strategically to separate elements",
                    "✏️ Group related content together",
                    "✏️ Remove decorative elements that don't serve a purpose",
                    "✏️ Simplify animations - avoid too many moving elements",
                    "✏️ Reduce the number of different font sizes (use max 3-4 sizes)",
                    "✏️ Follow 'less is more' principle - every element should have a purpose"
                ]
            })
        
        return issues
    
    def _check_hot_spots(self, image_array: np.ndarray) -> List[Dict]:
        """
        FR-021: Analyze which areas naturally attract attention (hot spots)
        """
        issues = []
        
        h, w = image_array.shape[:2]
        
        # Identify high-contrast areas that attract attention
        # Sample brightness patterns
        brightness = 0.299 * image_array[:,:,0] + 0.587 * image_array[:,:,1] + 0.114 * image_array[:,:,2]
        
        # Divide into 9 regions (3x3 grid)
        regions_brightness = []
        for i in range(3):
            for j in range(3):
                region = brightness[i*h//3:(i+1)*h//3, j*w//3:(j+1)*w//3]
                regions_brightness.append({
                    'position': f"{'top' if i==0 else 'middle' if i==1 else 'bottom'}-{'left' if j==0 else 'center' if j==1 else 'right'}",
                    'brightness': np.mean(region),
                    'variance': np.var(region)
                })
        
        # Sort by variance (high variance = more attention-grabbing)
        regions_brightness.sort(key=lambda x: x['variance'], reverse=True)
        hot_spots = [r['position'] for r in regions_brightness[:3]]
        
        issues.append({
            "category": "hot_spots",
            "title": "🔥 Visual Attention Areas",
            "description": f"High-attention areas detected: {', '.join(hot_spots[:2]).title()}",
            "severity": "info",
            "how_to_fix": [
                f"✏️ Your design naturally draws attention to: {', '.join(hot_spots).title()}",
                "✏️ Make sure these hot spots contain important content",
                "✏️ If not important, reduce contrast in these areas",
                "✏️ Use high-attention areas for calls-to-action (CTAs)",
                "✏️ Important content should be in prominent positions",
                "✏️ Consider user attention span - focus on 1-2 key messages",
                "✏️ Secondary information should be in lower-attention areas"
            ]
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
            "passing": success,
            "overall": "Design effectively guides user attention" if success >= 2 else "Design needs attention refinement"
        }
