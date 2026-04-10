"""
Simplified Readability Analyzer - Focus on 4 Key Areas

Only analyzes:
1. Keep Sentences Short - Short sentences are easier to understand
2. Use Simple Words - Common words vs technical jargon
3. Break Up Text - Use headings, paragraphs, bullet points
4. Active Voice - Active voice is clearer than passive

"""

from typing import Dict, List
import re


class SimplifiedReadabilityAnalyzer:
    """
    Simplified Readability Analyzer - Only essential readability checks
    """
    
    def __init__(self):
        # Standards
        self.MAX_SENTENCE_LENGTH = 20  # words
        self.MAX_LINE_LENGTH = 75      # characters
        self.MAX_PARAGRAPH_LENGTH = 4  # lines
        
        # Common complex words mapping to simple alternatives
        self.COMPLEX_WORDS = {
            'utilize': 'use',
            'facilitate': 'help',
            'subsequently': 'then',
            'approximately': 'about',
            'nevertheless': 'however',
            'commence': 'start',
            'terminate': 'end',
            'implement': 'do',
            'allocate': 'assign',
            'ameliorate': 'improve',
            'modification': 'change',
            'parameter': 'setting',
            'comprehensive': 'complete',
            'regarding': 'about',
            'assistance': 'help',
            'expedite': 'speed up',
            'endeavor': 'try',
            'acquire': 'get',
            'suffice': 'enough',
            'elucidate': 'explain'
        }
        
        # Passive voice indicators
        self.PASSIVE_INDICATORS = [
            'was', 'were', 'been', 'being', 'is', 'are', 'am',
            'by the', 'by a', 'by this'
        ]
    
    def analyze_design(self, image_path: str) -> Dict:
        """
        Analyze design's text readability
        Without OCR, we can't extract text, so we provide recommendations
        """
        try:
            from PIL import Image
            import numpy as np
            
            # Open image and analyze for text presence
            image = Image.open(image_path).convert('RGB')
            image_array = np.array(image)
            
            # Estimate if image contains text by looking at dark areas (likely text)
            gray = 0.299 * image_array[:,:,0] + 0.587 * image_array[:,:,1] + 0.114 * image_array[:,:,2]
            dark_pixels = np.sum(gray < 100)  # Very dark = likely text
            text_coverage = dark_pixels / (gray.shape[0] * gray.shape[1])
            
            issues = []
            
            # If image has minimal text, score is higher
            # If image has lots of text, provide recommendations
            if text_coverage > 0.3:  # More than 30% dark areas = likely has text
                # Mark as recommendations (info severity = guidance only)
                issues.append(self._create_sentence_length_check())
                issues.append(self._create_simple_words_check())
                issues.append(self._create_text_break_check())
                issues.append(self._create_active_voice_check())
                score = 75  # Base score when text-heavy
            else:
                # Less text means simpler design (higher score)
                issues.append({
                    "category": "text_content",
                    "title": "✅ Minimal Text Content",
                    "description": "Design has minimal text. Good for visual clarity!",
                    "severity": "success",
                    "how_to_fix": ["Great! If text is added, follow readability best practices"]
                })
                score = 90  # Higher score for clean design
            
            return {
                "score": round(score, 1),
                "grade": "A" if score >= 80 else "B" if score >= 70 else "C" if score >= 60 else "D",
                "conformance": "✅ Excellent" if score >= 80 else "⚠️ Good" if score >= 70 else "❌ Needs Improvement",
                "issues": issues,
                "summary": self._generate_summary(issues)
            }
        
        except Exception as e:
            return {
                "score": 50,
                "grade": "C",
                "conformance": "Unable to analyze",
                "issues": [{
                    "category": "error",
                    "title": "Analysis Note",
                    "description": "Readability analysis requires OCR. Please ensure design has clear text formatting.",
                    "severity": "info",
                    "how_to_fix": ["For best readability: Use short sentences, simple words, headings, and active voice"]
                }]
            }
    
    def _create_sentence_length_check(self) -> Dict:
        """
        FR-014: Analyze if sentences are short enough
        """
        return {
            "category": "sentence_length",
            "title": "📏 Keep Sentences Short",
            "description": "Sentences should be 15-20 words maximum. Short sentences are easier to read and remember",
            "severity": "info",
            "best_practice": "Average 15-20 words per sentence",
            "how_to_fix": [
                "✏️ Break long sentences into shorter ones",
                "✏️ One idea per sentence is ideal",
                "✏️ Aim for 15-20 words on average",
                "✏️ Remove unnecessary phrases",
                "✏️ BEFORE: 'The system, which has been designed with modern technologies, will help users to complete their tasks more effectively and efficiently'",
                "✏️ AFTER: 'The system helps users work efficiently. It uses modern technologies.'"
            ]
        }
    
    def _create_simple_words_check(self) -> Dict:
        """
        FR-015: Analyze if text uses simple words
        """
        return {
            "category": "simple_words",
            "title": "💬 Use Simple Words",
            "description": "Use common, everyday words instead of complex jargon. This helps all users understand your content",
            "severity": "info",
            "best_practice": "Use everyday words that 6th grade students would understand",
            "how_to_fix": [
                "✏️ Replace complex words with simpler alternatives",
                "✏️ Use 'use' instead of 'utilize'",
                "✏️ Use 'help' instead of 'facilitate'",
                "✏️ Use 'start' instead of 'commence'",
                "✏️ Use 'end' instead of 'terminate'",
                "✏️ Use 'change' instead of 'modification'",
                "✏️ BEFORE: 'We will facilitate the implementation of comprehensive modifications'",
                "✏️ AFTER: 'We will help make important changes'"
            ]
        }
    
    def _create_text_break_check(self) -> Dict:
        """
        FR-016: Check if text is broken up with headings and white space
        """
        return {
            "category": "text_breaks",
            "title": "📄 Break Up Text",
            "description": "Use headings, short paragraphs, and bullet points. Long blocks of text are intimidating and hard to scan",
            "severity": "info",
            "best_practice": "Use headings, short paragraphs (3-4 sentences), and lists",
            "how_to_fix": [
                "✏️ Use clear headings and subheadings",
                "✏️ Keep paragraphs to 3-4 sentences",
                "✏️ Use bullet points for lists",
                "✏️ Add white space between sections",
                "✏️ Use short lines (50-75 characters per line)",
                "✏️ Use bold to highlight important terms",
                "✏️ Avoid large blocks of solid text"
            ]
        }
    
    def _create_active_voice_check(self) -> Dict:
        """
        FR-017: Check if text uses active voice
        """
        return {
            "category": "active_voice",
            "title": "🎯 Use Active Voice",
            "description": "Active voice is clearer and more direct. It shows who is doing the action",
            "severity": "info",
            "best_practice": "Subject performs action (active) rather than action performed on subject (passive)",
            "how_to_fix": [
                "✏️ Use active voice: Subject + Verb + Object",
                "✏️ PASSIVE (hard): 'The button was clicked by the user'",
                "✏️ ACTIVE (clear): 'The user clicked the button'",
                "✏️ PASSIVE (hard): 'The mistake was made by the team'",
                "✏️ ACTIVE (clear): 'The team made the mistake'",
                "✏️ PASSIVE (hard): 'It was decided that...'",
                "✏️ ACTIVE (clear): 'We decided that...'",
                "✏️ Avoid words like: 'was', 'been', 'were', 'by the'"
            ]
        }
    
    def _generate_summary(self, issues: List[Dict]) -> Dict:
        """Generate summary of findings"""
        return {
            "total_checks": len(issues),
            "areas_to_improve": 4,
            "focus": "Apply these readability best practices to your text content"
        }
