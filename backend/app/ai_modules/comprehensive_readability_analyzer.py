"""
Comprehensive Readability Analyzer
Implements FR-013 to FR-016 requirements

Features:
- FR-013: Flesch-Kincaid readability scores
- FR-014: Complex vocabulary, jargon, and long sentence detection
- FR-015: Non-inclusive language detection
- FR-016: Typography evaluation (font, line height, spacing, line length)
"""

from PIL import Image, ImageFont
import pytesseract
import textstat
import numpy as np
from typing import Dict, List, Tuple
import re


class ComprehensiveReadabilityAnalyzer:
    """
    Complete Readability Analyzer with inclusive language checking
    """
    
    def __init__(self):
        # Readability standards
        self.OPTIMAL_LINE_LENGTH = (50, 75)  # characters
        self.MAX_SENTENCE_LENGTH = 20  # words
        self.MAX_TEXT_DENSITY = 0.4
        
        # Typography standards
        self.MIN_LINE_HEIGHT = 1.5  # relative to font size
        self.OPTIMAL_LINE_HEIGHT = (1.5, 2.0)
        self.MIN_LETTER_SPACING = 0
        self.OPTIMAL_PARAGRAPH_SPACING = 1.5
        
        # Non-inclusive language patterns
        self.NON_INCLUSIVE_PATTERNS = {
            # Gendered terms
            "gendered": [
                (r'\bhe\b', "he", "they/he or she"),
                (r'\bshe\b', "she", "they/she or he"),
                (r'\bhim\b', "him", "them/him or her"),
                (r'\bher\b', "her", "them/her or his"),
                (r'\bhis\b', "his", "their/his or her"),
                (r'\bmanpower\b', "manpower", "workforce/staffing"),
                (r'\bchairman\b', "chairman", "chairperson/chair"),
                (r'\bguys\b', "guys", "folks/everyone/team"),
                (r'\bsalesman\b', "salesman", "salesperson"),
                (r'\bwaiter\b', "waiter", "server"),
                (r'\bwaitress\b', "waitress", "server"),
            ],
            # Ableist terms
            "ableist": [
                (r'\bcrazy\b', "crazy", "unexpected/surprising"),
                (r'\binsane\b', "insane", "incredible/extreme"),
                (r'\bdumb\b', "dumb", "ineffective/unclear"),
                (r'\blame\b', "lame", "ineffective/boring"),
                (r'\bblind to\b', "blind to", "unaware of/overlooking"),
                (r'\bdeaf to\b', "deaf to", "ignoring/dismissing"),
                (r'\bcripple\b', "cripple", "impede/hinder"),
                (r'\bhandicap\b', "handicap", "barrier/limitation"),
            ],
            # Age-related
            "age_related": [
                (r'\byoung blood\b', "young blood", "new talent/fresh perspective"),
                (r'\bold guard\b', "old guard", "experienced team/veterans"),
            ],
            # Other potentially insensitive
            "insensitive": [
                (r'\bmaster\b', "master", "primary/main"),
                (r'\bslave\b', "slave", "secondary/replica"),
                (r'\bblacklist\b', "blacklist", "blocklist/denylist"),
                (r'\bwhitelist\b', "whitelist", "allowlist/safelist"),
            ]
        }
        
        # Complex/jargon words (tech-focused, expand as needed)
        self.JARGON_TERMS = {
            "leverage": "use",
            "synergy": "cooperation",
            "paradigm": "model",
            "utilize": "use",
            "facilitate": "help",
            "optimize": "improve",
            "bandwidth": "time/capacity",
            "circle back": "follow up",
            "deep dive": "detailed analysis",
            "low-hanging fruit": "easy wins",
        }
    
    def analyze_design(self, image_path: str) -> Dict:
        """
        Complete readability analysis
        """
        image = Image.open(image_path)
        
        # FR-013: Extract text and compute readability scores
        text = self._extract_text(image)
        
        if not text.strip():
            return {
                "score": 50,
                "text_found": False,
                "issues": [{"type": "No Text", "description": "No text detected in design"}],
                "recommendations": ["Add text content for readability analysis"]
            }
        
        # Calculate all metrics
        readability_scores = self._calculate_readability_scores(text)
        vocabulary_issues = self._check_vocabulary(text)
        sentence_issues = self._check_sentence_length(text)
        inclusive_issues = self._check_inclusive_language(text)
        typography_issues = self._evaluate_typography(image, text)
        
        # Combine all issues
        all_issues = (
            vocabulary_issues + 
            sentence_issues + 
            inclusive_issues + 
            typography_issues
        )
        
        # Calculate score
        score = self._calculate_score(readability_scores, all_issues)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(all_issues, readability_scores)
        
        return {
            "score": round(score, 2),
            "text_found": True,
            "text_preview": text[:200] + "..." if len(text) > 200 else text,
            "word_count": len(text.split()),
            "readability_scores": readability_scores,
            "issues": all_issues,
            "issue_summary": {
                "vocabulary": len(vocabulary_issues),
                "sentence_length": len(sentence_issues),
                "inclusive_language": len(inclusive_issues),
                "typography": len(typography_issues)
            },
            "recommendations": recommendations,
            "grade_level": self._get_grade_level_description(readability_scores["flesch_kincaid_grade"])
        }
    
    def _extract_text(self, image: Image.Image) -> str:
        """Extract text using OCR"""
        try:
            gray_image = image.convert('L')
            text = pytesseract.image_to_string(gray_image, lang='eng')
            return text.strip()
        except Exception as e:
            print(f"OCR Error: {e}")
            return ""
    
    def _calculate_readability_scores(self, text: str) -> Dict:
        """
        FR-013: Compute Flesch-Kincaid and other readability scores
        """
        text = re.sub(r'\s+', ' ', text).strip()
        
        word_count = len(text.split())
        sentence_count = max(1, text.count('.') + text.count('!') + text.count('?'))
        char_count = len(text)
        
        scores = {
            "word_count": word_count,
            "sentence_count": sentence_count,
            "character_count": char_count,
            "avg_sentence_length": round(word_count / sentence_count, 1)
        }
        
        # Calculate if enough text
        if word_count > 10:
            # FR-013: Flesch-Kincaid scores
            scores["flesch_reading_ease"] = round(textstat.flesch_reading_ease(text), 1)
            scores["flesch_kincaid_grade"] = round(textstat.flesch_kincaid_grade(text), 1)
            scores["gunning_fog"] = round(textstat.gunning_fog(text), 1)
            scores["smog_index"] = round(textstat.smog_index(text), 1)
            scores["coleman_liau_index"] = round(textstat.coleman_liau_index(text), 1)
            scores["automated_readability_index"] = round(textstat.automated_readability_index(text), 1)
        else:
            scores["flesch_reading_ease"] = 100
            scores["flesch_kincaid_grade"] = 0
            scores["gunning_fog"] = 0
            scores["smog_index"] = 0
            scores["coleman_liau_index"] = 0
            scores["automated_readability_index"] = 0
        
        return scores
    
    def _check_vocabulary(self, text: str) -> List[Dict]:
        """
        FR-014: Flag complex vocabulary and jargon
        """
        issues = []
        words = re.findall(r'\b\w+\b', text.lower())
        
        # Check for jargon
        for word in words:
            if word in self.JARGON_TERMS:
                issues.append({
                    "id": f"jargon_{word}",
                    "category": "Readability",
                    "subcategory": "Vocabulary",
                    "severity": "medium",
                    "type": "Jargon Detected",
                    "term": word,
                    "description": f"Jargon term '{word}' may not be clear to all users",
                    "suggestion": self.JARGON_TERMS[word],
                    "confidence": 0.85,
                    "explanation": f"The term '{word}' is jargon that may confuse users. Consider using '{self.JARGON_TERMS[word]}' instead.",
                    "fix_suggestion": f"Replace '{word}' with '{self.JARGON_TERMS[word]}'"
                })
        
        # Check for complex words (4+ syllables)
        for word in set(words):
            if len(word) > 12:  # Heuristic for complex words
                issues.append({
                    "id": f"complex_{word}",
                    "category": "Readability",
                    "subcategory": "Vocabulary",
                    "severity": "low",
                    "type": "Complex Word",
                    "term": word,
                    "description": f"Complex word '{word}' may reduce readability",
                    "confidence": 0.70,
                    "explanation": f"'{word}' is a complex word. Consider using simpler alternatives.",
                    "fix_suggestion": "Consider using a simpler alternative if available"
                })
        
        return issues
    
    def _check_sentence_length(self, text: str) -> List[Dict]:
        """
        FR-014: Flag sentences exceeding 20 words
        """
        issues = []
        
        # Split into sentences
        sentences = re.split(r'[.!?]+', text)
        
        for i, sentence in enumerate(sentences):
            sentence = sentence.strip()
            if not sentence:
                continue
            
            word_count = len(sentence.split())
            
            # FR-014: Flag sentences > 20 words
            if word_count > self.MAX_SENTENCE_LENGTH:
                severity = "high" if word_count > 30 else "medium"
                
                issues.append({
                    "id": f"long_sentence_{i}",
                    "category": "Readability",
                    "subcategory": "Sentence Length",
                    "severity": severity,
                    "type": "Long Sentence",
                    "description": f"Sentence with {word_count} words exceeds recommended maximum",
                    "sentence_preview": sentence[:100] + "..." if len(sentence) > 100 else sentence,
                    "word_count": word_count,
                    "recommended_max": self.MAX_SENTENCE_LENGTH,
                    "confidence": 0.95,
                    "explanation": f"This sentence has {word_count} words, which exceeds the recommended maximum of {self.MAX_SENTENCE_LENGTH} words.",
                    "fix_suggestion": "Break this sentence into shorter, clearer sentences."
                })
        
        return issues
    
    def _check_inclusive_language(self, text: str) -> List[Dict]:
        """
        FR-015: Detect non-inclusive language
        """
        issues = []
        text_lower = text.lower()
        
        for category, patterns in self.NON_INCLUSIVE_PATTERNS.items():
            for pattern, term, alternative in patterns:
                matches = list(re.finditer(pattern, text_lower, re.IGNORECASE))
                
                for match in matches:
                    severity = "high" if category in ["gendered", "ableist"] else "medium"
                    
                    issues.append({
                        "id": f"inclusive_{category}_{match.start()}",
                        "category": "Readability",
                        "subcategory": "Inclusive Language",
                        "severity": severity,
                        "type": f"Non-inclusive Language ({category.replace('_', ' ').title()})",
                        "term": term,
                        "description": f"Non-inclusive {category.replace('_', ' ')} language detected",
                        "context": text[max(0, match.start()-20):min(len(text), match.end()+20)],
                        "position": match.start(),
                        "alternative": alternative,
                        "category_type": category,
                        "confidence": 0.80,
                        "explanation": f"The term '{term}' may not be inclusive. Consider using '{alternative}' instead.",
                        "fix_suggestion": f"Replace '{term}' with '{alternative}' for more inclusive language.",
                        "resources": ["https://www.apa.org/about/apa/equity-diversity-inclusion/language-guidelines"]
                    })
        
        return issues
    
    def _evaluate_typography(self, image: Image.Image, text: str) -> List[Dict]:
        """
        FR-016: Evaluate typography (font, line height, spacing, line length)
        """
        issues = []
        width, height = image.size
        
        # Estimate line length (characters per line)
        lines = text.split('\n')
        line_lengths = [len(line) for line in lines if line.strip()]
        
        if line_lengths:
            avg_line_length = np.mean(line_lengths)
            
            # Check line length
            if avg_line_length < self.OPTIMAL_LINE_LENGTH[0]:
                issues.append({
                    "id": "typography_line_length_short",
                    "category": "Readability",
                    "subcategory": "Typography",
                    "severity": "low",
                    "type": "Short Line Length",
                    "description": f"Average line length ({avg_line_length:.0f} chars) is below optimal range",
                    "current_value": round(avg_line_length, 1),
                    "optimal_range": self.OPTIMAL_LINE_LENGTH,
                    "confidence": 0.70,
                    "explanation": f"Lines average {avg_line_length:.0f} characters. Optimal is {self.OPTIMAL_LINE_LENGTH[0]}-{self.OPTIMAL_LINE_LENGTH[1]} characters.",
                    "fix_suggestion": f"Increase line length to {self.OPTIMAL_LINE_LENGTH[0]}-{self.OPTIMAL_LINE_LENGTH[1]} characters for better readability."
                })
            elif avg_line_length > self.OPTIMAL_LINE_LENGTH[1]:
                issues.append({
                    "id": "typography_line_length_long",
                    "category": "Readability",
                    "subcategory": "Typography",
                    "severity": "medium",
                    "type": "Long Line Length",
                    "description": f"Average line length ({avg_line_length:.0f} chars) exceeds optimal range",
                    "current_value": round(avg_line_length, 1),
                    "optimal_range": self.OPTIMAL_LINE_LENGTH,
                    "confidence": 0.70,
                    "explanation": f"Lines average {avg_line_length:.0f} characters. Optimal is {self.OPTIMAL_LINE_LENGTH[0]}-{self.OPTIMAL_LINE_LENGTH[1]} characters.",
                    "fix_suggestion": f"Reduce line length to {self.OPTIMAL_LINE_LENGTH[0]}-{self.OPTIMAL_LINE_LENGTH[1]} characters for better readability."
                })
        
        # Check text density
        # Estimate text area vs total area (simplified)
        estimated_text_area = len(text) * 10  # Rough estimate
        total_area = width * height
        text_density = min(1.0, estimated_text_area / total_area) if total_area > 0 else 0
        
        if text_density > self.MAX_TEXT_DENSITY:
            issues.append({
                "id": "typography_density",
                "category": "Readability",
                "subcategory": "Typography",
                "severity": "medium",
                "type": "High Text Density",
                "description": f"Text density ({text_density:.1%}) is too high",
                "current_value": round(text_density * 100, 1),
                "maximum_recommended": round(self.MAX_TEXT_DENSITY * 100, 1),
                "confidence": 0.65,
                "explanation": f"Text covers approximately {text_density:.1%} of the design. This may overwhelm users.",
                "fix_suggestion": "Reduce text amount or increase white space for better readability."
            })
        
        # Line height recommendation
        issues.append({
            "id": "typography_line_height",
            "category": "Readability",
            "subcategory": "Typography",
            "severity": "info",
            "type": "Line Height Recommendation",
            "description": "Ensure line height is 1.5-2.0x font size",
            "optimal_range": self.OPTIMAL_LINE_HEIGHT,
            "confidence": 1.0,
            "explanation": "Line height (leading) should be 1.5-2.0 times the font size for optimal readability.",
            "fix_suggestion": "Set line-height to 1.5-2.0 in your CSS or design tool."
        })
        
        # Font selection guidance
        issues.append({
            "id": "typography_font",
            "category": "Readability",
            "subcategory": "Typography",
            "severity": "info",
            "type": "Font Selection Guidance",
            "description": "Use clear, readable fonts",
            "confidence": 1.0,
            "explanation": "Choose fonts designed for screen readability. Sans-serif fonts like Arial, Helvetica, or Open Sans work well for body text.",
            "fix_suggestion": "Use readable sans-serif fonts for body text and ensure sufficient font weight."
        })
        
        return issues
    
    def _calculate_score(self, readability_scores: Dict, issues: List[Dict]) -> float:
        """Calculate overall readability score"""
        base_score = 100
        
        # Deduct based on Flesch Reading Ease
        fre = readability_scores.get("flesch_reading_ease", 100)
        if fre < 30:
            base_score -= 30
        elif fre < 50:
            base_score -= 15
        elif fre < 60:
            base_score -= 5
        
        # Deduct for issues
        for issue in issues:
            severity = issue.get("severity", "low")
            if severity == "critical":
                base_score -= 10
            elif severity == "high":
                base_score -= 7
            elif severity == "medium":
                base_score -= 3
            elif severity == "low":
                base_score -= 1
            # Info issues don't deduct
        
        return max(0, min(100, base_score))
    
    def _generate_recommendations(self, issues: List[Dict], readability_scores: Dict) -> List[Dict]:
        """Generate actionable recommendations"""
        recommendations = []
        
        # Group by category
        categories = {}
        for issue in issues:
            cat = issue.get("subcategory", "General")
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(issue)
        
        # Vocabulary recommendations
        if "Vocabulary" in categories:
            jargon_count = len([i for i in categories["Vocabulary"] if i["type"] == "Jargon Detected"])
            if jargon_count > 0:
                recommendations.append({
                    "category": "Vocabulary",
                    "priority": "medium",
                    "title": "Simplify Vocabulary",
                    "description": f"Found {jargon_count} instances of jargon or complex terms",
                    "action": "Replace technical jargon with plain language alternatives",
                    "impact": "Improves comprehension for diverse audiences",
                    "resources": ["https://www.plainlanguage.gov/"]
                })
        
        # Sentence length recommendations
        if "Sentence Length" in categories:
            long_sentences = len(categories["Sentence Length"])
            if long_sentences > 0:
                recommendations.append({
                    "category": "Sentence Structure",
                    "priority": "high",
                    "title": "Shorten Long Sentences",
                    "description": f"Found {long_sentences} sentences exceeding 20 words",
                    "action": "Break long sentences into shorter, clearer statements",
                    "impact": "Significantly improves readability and comprehension",
                    "resources": []
                })
        
        # Inclusive language recommendations
        if "Inclusive Language" in categories:
            inclusive_issues = len(categories["Inclusive Language"])
            if inclusive_issues > 0:
                recommendations.append({
                    "category": "Inclusive Language",
                    "priority": "high",
                    "title": "Use Inclusive Language",
                    "description": f"Found {inclusive_issues} instances of potentially non-inclusive language",
                    "action": "Replace gendered, ableist, or insensitive terms with inclusive alternatives",
                    "impact": "Creates welcoming experience for all users",
                    "resources": [
                        "https://www.apa.org/about/apa/equity-diversity-inclusion/language-guidelines",
                        "https://buffer.com/resources/inclusive-language-tech/"
                    ]
                })
        
        # Typography recommendations
        if "Typography" in categories:
            recommendations.append({
                "category": "Typography",
                "priority": "medium",
                "title": "Optimize Typography",
                "description": "Improve text formatting for better readability",
                "action": "Adjust line length (50-75 chars), line height (1.5-2.0x), and font selection",
                "impact": "Enhances reading comfort and reduces eye strain",
                "resources": ["https://practicaltypography.com/"]
            })
        
        # Overall readability recommendation
        fk_grade = readability_scores.get("flesch_kincaid_grade", 0)
        if fk_grade > 12:
            recommendations.append({
                "category": "Overall Readability",
                "priority": "high",
                "title": "Simplify Text Complexity",
                "description": f"Content requires Grade {fk_grade:.0f} reading level",
                "action": "Aim for Grade 8-10 reading level for general audiences",
                "impact": "Makes content accessible to wider audience",
                "resources": ["https://www.nngroup.com/articles/legibility-readability-comprehension/"]
            })
        
        return recommendations
    
    def _get_grade_level_description(self, grade: float) -> str:
        """Get human-readable grade level description"""
        if grade <= 6:
            return f"Grade {grade:.0f} - Easy to read (Elementary school level)"
        elif grade <= 8:
            return f"Grade {grade:.0f} - Plain English (Middle school level)"
        elif grade <= 12:
            return f"Grade {grade:.0f} - Conversational (High school level)"
        elif grade <= 16:
            return f"Grade {grade:.0f} - Difficult (College level)"
        else:
            return f"Grade {grade:.0f} - Very Difficult (Professional/Academic level)"
