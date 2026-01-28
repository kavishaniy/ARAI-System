from PIL import Image
import pytesseract
import textstat
import numpy as np
from typing import Dict, List
import re


class ReadabilityAnalyzer:
    """
    Analyzes text readability in UI designs
    - OCR text extraction
    - Reading level assessment
    - Text density analysis
    - Line length and spacing
    """
    
    def __init__(self):
        # Configure Tesseract path if needed
        # pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
        self.OPTIMAL_LINE_LENGTH = (50, 75)  # Characters per line
        self.MAX_TEXT_DENSITY = 0.4  # 40% of screen
    
    def analyze_design(self, image_path: str) -> Dict:
        """Main analysis function"""
        image = Image.open(image_path)
        
        # Extract text using OCR
        text = self._extract_text(image)
        
        if not text.strip():
            return {
                "score": 50,
                "metrics": {},
                "issues": [{"type": "No Text", "description": "No text detected in design"}],
                "recommendations": ["Add text content to analyze readability"]
            }
        
        # Analyze text
        metrics = self._calculate_metrics(text)
        issues = self._identify_issues(metrics, image)
        
        # Calculate score
        score = self._calculate_score(metrics, issues)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(issues, metrics)
        
        return {
            "score": score,
            "metrics": metrics,
            "issues": issues,
            "recommendations": recommendations
        }
    
    def _extract_text(self, image: Image.Image) -> str:
        """Extract text from image using OCR"""
        try:
            # Convert to grayscale for better OCR
            gray_image = image.convert('L')
            
            # Extract text
            text = pytesseract.image_to_string(gray_image, lang='eng')
            return text.strip()
        except Exception as e:
            print(f"OCR Error: {e}")
            return ""
    
    def _calculate_metrics(self, text: str) -> Dict:
        """Calculate readability metrics"""
        # Clean text
        text = re.sub(r'\s+', ' ', text).strip()
        
        metrics = {
            "word_count": len(text.split()),
            "character_count": len(text),
            "sentence_count": text.count('.') + text.count('!') + text.count('?'),
        }
        
        # Reading level scores
        if metrics["word_count"] > 10:  # Need sufficient text
            metrics["flesch_reading_ease"] = textstat.flesch_reading_ease(text)
            metrics["flesch_kincaid_grade"] = textstat.flesch_kincaid_grade(text)
            metrics["gunning_fog"] = textstat.gunning_fog(text)
        else:
            metrics["flesch_reading_ease"] = 100  # Assume simple if too short
            metrics["flesch_kincaid_grade"] = 0
            metrics["gunning_fog"] = 0
        
        # Calculate average line length (estimate)
        lines = text.split('\n')
        line_lengths = [len(line) for line in lines if line.strip()]
        metrics["avg_line_length"] = np.mean(line_lengths) if line_lengths else 0
        
        return metrics
    
    def _identify_issues(self, metrics: Dict, image: Image.Image) -> List[Dict]:
        """Identify readability issues"""
        issues = []
        
        # Check reading level
        if metrics.get("flesch_reading_ease", 100) < 50:
            issues.append({
                "type": "Complex Text",
                "severity": "medium",
                "description": "Text may be too complex for general audience",
                "value": metrics["flesch_reading_ease"]
            })
        
        if metrics.get("flesch_kincaid_grade", 0) > 12:
            issues.append({
                "type": "High Grade Level",
                "severity": "medium",
                "description": f"Text requires grade {metrics['flesch_kincaid_grade']:.1f} reading level",
                "value": metrics["flesch_kincaid_grade"]
            })
        
        # Check line length
        if metrics["avg_line_length"] > 75:
            issues.append({
                "type": "Long Lines",
                "severity": "low",
                "description": "Text lines are too long (optimal: 50-75 characters)",
                "value": metrics["avg_line_length"]
            })
        
        # Check text density
        image_area = image.size[0] * image.size[1]
        text_area = metrics["character_count"] * 100  # Rough estimate
        density = text_area / image_area
        
        if density > self.MAX_TEXT_DENSITY:
            issues.append({
                "type": "High Text Density",
                "severity": "medium",
                "description": "Too much text on screen, consider breaking into sections"
            })
        
        return issues
    
    def _calculate_score(self, metrics: Dict, issues: List[Dict]) -> float:
        """Calculate overall readability score"""
        base_score = 100
        
        # Deduct points for issues
        for issue in issues:
            if issue["severity"] == "high":
                base_score -= 15
            elif issue["severity"] == "medium":
                base_score -= 10
            else:
                base_score -= 5
        
        # Bonus for good readability
        if metrics.get("flesch_reading_ease", 0) > 60:
            base_score = min(100, base_score + 10)
        
        return max(0, base_score)
    
    def _generate_recommendations(self, issues: List[Dict], metrics: Dict) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        for issue in issues:
            if issue["type"] == "Complex Text":
                recommendations.append(
                    "Simplify language - use shorter words and sentences"
                )
                recommendations.append(
                    "Break complex ideas into smaller, digestible chunks"
                )
            elif issue["type"] == "High Grade Level":
                recommendations.append(
                    f"Reduce reading level to grade 8-10 for better accessibility"
                )
            elif issue["type"] == "Long Lines":
                recommendations.append(
                    "Shorten line length to 50-75 characters for better readability"
                )
                recommendations.append(
                    "Increase font size or reduce container width"
                )
            elif issue["type"] == "High Text Density":
                recommendations.append(
                    "Add more white space around text"
                )
                recommendations.append(
                    "Break content into multiple pages or sections"
                )
        
        if not recommendations:
            recommendations.append("Excellent text readability!")
        
        return recommendations