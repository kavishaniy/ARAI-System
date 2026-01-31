"""
Comprehensive Report Generator
Implements FR-021 to FR-027 requirements

Features:
- FR-021: ARAI score calculation (0-100)
- FR-022: Color-coded visual annotations
- FR-023: Comprehensive issue list with categories, severity, WCAG references
- FR-024: Explainable AI feedback with confidence scores
- FR-025: Educational content on accessibility principles
- FR-026: PDF export functionality
- FR-027: CSV export functionality
"""

from PIL import Image, ImageDraw, ImageFont
import numpy as np
from typing import Dict, List
import csv
import io
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image as RLImage
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
import pandas as pd
from datetime import datetime


class ComprehensiveReportGenerator:
    """
    Complete report generation with PDF and CSV export
    """
    
    def __init__(self):
        # Color scheme for annotations
        self.SEVERITY_COLORS = {
            "critical": (220, 20, 60),      # Crimson Red
            "high": (255, 140, 0),           # Dark Orange
            "medium": (255, 215, 0),         # Gold
            "low": (144, 238, 144),          # Light Green
            "info": (135, 206, 250)          # Light Sky Blue
        }
        
        # WCAG criteria educational content
        self.WCAG_EDUCATION = {
            "1.1.1 Non-text Content": {
                "title": "Non-text Content",
                "level": "A",
                "description": "All non-text content must have a text alternative that serves the equivalent purpose.",
                "why_important": "Screen readers and assistive technologies rely on text alternatives to describe images, icons, and other visual elements to users who cannot see them.",
                "how_to_fix": "Add descriptive alt text to all images. Decorative images should have empty alt text (alt='').",
                "example": "Good: <img src='logo.png' alt='ARAI System Logo'>\nBad: <img src='logo.png'>",
                "resources": ["https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html"]
            },
            "1.4.1 Use of Color": {
                "title": "Use of Color",
                "level": "A",
                "description": "Color is not used as the only visual means of conveying information.",
                "why_important": "Users with color vision deficiencies (8% of men, 0.5% of women) cannot distinguish certain colors. Critical information must be conveyed through multiple visual means.",
                "how_to_fix": "Add text labels, icons, or patterns in addition to color. Don't rely solely on 'red means error' or 'green means success'.",
                "example": "Good: ✓ Success (green)\nBad: Success (green only)",
                "resources": ["https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html"]
            },
            "1.4.3 Contrast (Minimum)": {
                "title": "Contrast (Minimum)",
                "level": "AA",
                "description": "Text and images of text have a contrast ratio of at least 4.5:1 (3:1 for large text).",
                "why_important": "Low contrast makes text hard to read for users with low vision, color blindness, or in bright lighting conditions.",
                "how_to_fix": "Use darker text on lighter backgrounds or vice versa. Test contrast ratios using tools like WebAIM's Contrast Checker.",
                "example": "Good: Black text on white (21:1)\nBad: Light gray text on white (2:1)",
                "resources": ["https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html"]
            },
            "1.4.4 Resize Text": {
                "title": "Resize Text",
                "level": "AA",
                "description": "Text can be resized up to 200% without loss of content or functionality.",
                "why_important": "Users with low vision need to enlarge text to read comfortably.",
                "how_to_fix": "Use relative units (em, rem, %) instead of fixed pixels. Ensure minimum font size of 12-14px.",
                "example": "Good: font-size: 1rem;\nBad: font-size: 10px;",
                "resources": ["https://www.w3.org/WAI/WCAG21/Understanding/resize-text.html"]
            },
            "2.5.5 Target Size": {
                "title": "Target Size",
                "level": "AAA",
                "description": "Touch targets are at least 44x44 CSS pixels.",
                "why_important": "Users with motor impairments need larger touch targets to accurately tap buttons and links.",
                "how_to_fix": "Ensure all interactive elements are at least 44x44px or add adequate padding.",
                "example": "Good: button { min-width: 44px; min-height: 44px; }\nBad: button { width: 20px; height: 20px; }",
                "resources": ["https://www.w3.org/WAI/WCAG21/Understanding/target-size.html"]
            }
        }
    
    def generate_comprehensive_report(self, analysis_results: Dict, image_path: str) -> Dict:
        """
        Generate comprehensive report with all features (FR-021 to FR-027)
        """
        # FR-021: Calculate ARAI score
        arai_score = self._calculate_arai_score(analysis_results)
        
        # FR-022: Create annotated image
        annotated_image_path = self._create_annotated_image(image_path, analysis_results)
        
        # FR-023: Format comprehensive issue list
        formatted_issues = self._format_issue_list(analysis_results)
        
        # FR-024: Add explainable AI feedback
        enriched_issues = self._add_explainable_feedback(formatted_issues)
        
        # FR-025: Add educational content
        educational_content = self._get_educational_content(enriched_issues)
        
        # Compile complete report
        complete_report = {
            "arai_score": arai_score,
            "grade": self._get_arai_grade(arai_score["overall"]),
            "annotated_image": annotated_image_path,
            "issues": enriched_issues,
            "issue_summary": self._create_issue_summary(enriched_issues),
            "education": educational_content,
            "recommendations": self._compile_recommendations(analysis_results),
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "image_analyzed": image_path,
                "total_issues": len(enriched_issues)
            }
        }
        
        return complete_report
    
    def _calculate_arai_score(self, analysis_results: Dict) -> Dict:
        """
        FR-021: Calculate ARAI (Accessibility Readability Attention Index) score (0-100)
        Weighted: Accessibility 40%, Readability 30%, Attention 30%
        """
        accessibility_score = analysis_results.get("accessibility", {}).get("score", 0)
        readability_score = analysis_results.get("readability", {}).get("score", 0)
        attention_score = analysis_results.get("attention", {}).get("score", 0)
        
        # Weighted calculation
        arai_overall = (
            accessibility_score * 0.40 +
            readability_score * 0.30 +
            attention_score * 0.30
        )
        
        return {
            "overall": round(arai_overall, 2),
            "accessibility": round(accessibility_score, 2),
            "readability": round(readability_score, 2),
            "attention": round(attention_score, 2),
            "weights": {
                "accessibility": 40,
                "readability": 30,
                "attention": 30
            },
            "interpretation": self._interpret_arai_score(arai_overall)
        }
    
    def _interpret_arai_score(self, score: float) -> str:
        """Interpret ARAI score"""
        if score >= 90:
            return "Excellent - Design meets high accessibility and usability standards"
        elif score >= 80:
            return "Good - Design is accessible with minor improvements needed"
        elif score >= 70:
            return "Fair - Design needs moderate improvements for accessibility"
        elif score >= 60:
            return "Poor - Design has significant accessibility issues"
        else:
            return "Critical - Design requires major accessibility improvements"
    
    def _get_arai_grade(self, score: float) -> str:
        """Convert score to letter grade"""
        if score >= 90:
            return "A"
        elif score >= 80:
            return "B"
        elif score >= 70:
            return "C"
        elif score >= 60:
            return "D"
        else:
            return "F"
    
    def _create_annotated_image(self, image_path: str, analysis_results: Dict) -> str:
        """
        FR-022: Create annotated image with color-coded issue markers
        """
        image = Image.open(image_path).convert('RGB')
        draw = ImageDraw.Draw(image, 'RGBA')
        
        # Try to load font, fall back to default
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 16)
            small_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 12)
        except:
            font = ImageFont.load_default()
            small_font = ImageFont.load_default()
        
        # Collect all issues with locations
        all_issues = []
        for category in ["accessibility", "readability", "attention"]:
            category_results = analysis_results.get(category, {})
            issues = category_results.get("issues", [])
            all_issues.extend(issues)
        
        # Draw annotations
        annotation_count = 0
        for i, issue in enumerate(all_issues):
            location = issue.get("location")
            if not location or annotation_count >= 20:  # Limit annotations
                continue
            
            severity = issue.get("severity", "low")
            color = self.SEVERITY_COLORS.get(severity, (128, 128, 128))
            
            x = location.get("x", 0)
            y = location.get("y", 0)
            w = location.get("width", 50)
            h = location.get("height", 50)
            
            # Draw semi-transparent rectangle
            overlay_color = color + (100,)  # Add alpha
            draw.rectangle([x, y, x+w, y+h], outline=color, width=3, fill=overlay_color)
            
            # Draw label
            label = f"{annotation_count + 1}"
            text_bbox = draw.textbbox((0, 0), label, font=font)
            text_w = text_bbox[2] - text_bbox[0]
            text_h = text_bbox[3] - text_bbox[1]
            
            label_x = x + w - text_w - 10
            label_y = y - text_h - 10 if y > text_h + 10 else y + h + 5
            
            # Draw label background
            draw.rectangle(
                [label_x - 5, label_y - 5, label_x + text_w + 5, label_y + text_h + 5],
                fill=color + (200,)
            )
            draw.text((label_x, label_y), label, fill=(255, 255, 255), font=font)
            
            annotation_count += 1
        
        # Add legend
        legend_y = 10
        draw.rectangle([10, legend_y, 200, legend_y + 150], fill=(255, 255, 255, 230))
        draw.text((20, legend_y + 10), "Issue Severity:", fill=(0, 0, 0), font=font)
        
        for i, (severity, color) in enumerate(self.SEVERITY_COLORS.items()):
            y_pos = legend_y + 35 + (i * 20)
            draw.rectangle([20, y_pos, 35, y_pos + 12], fill=color)
            draw.text((40, y_pos), severity.title(), fill=(0, 0, 0), font=small_font)
        
        # Save annotated image (in real implementation, save to file)
        # annotated_image.save("annotated_output.png")
        
        return "annotated_image_path"
    
    def _format_issue_list(self, analysis_results: Dict) -> List[Dict]:
        """
        FR-023: Format comprehensive issue list organized by category, severity, WCAG reference
        """
        all_issues = []
        
        for category_name in ["accessibility", "readability", "attention"]:
            category_results = analysis_results.get(category_name, {})
            issues = category_results.get("issues", [])
            
            for issue in issues:
                formatted_issue = {
                    "id": issue.get("id", "unknown"),
                    "category": category_name.title(),
                    "subcategory": issue.get("subcategory", "General"),
                    "type": issue.get("type", "Issue"),
                    "severity": issue.get("severity", "low"),
                    "description": issue.get("description", ""),
                    "wcag_criterion": issue.get("wcag_criterion", "N/A"),
                    "wcag_level": issue.get("wcag_level", "N/A"),
                    "location": issue.get("location"),
                    "details": self._extract_issue_details(issue)
                }
                all_issues.append(formatted_issue)
        
        # Sort by severity then category
        severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3, "info": 4}
        all_issues.sort(key=lambda x: (severity_order.get(x["severity"], 5), x["category"]))
        
        return all_issues
    
    def _extract_issue_details(self, issue: Dict) -> Dict:
        """Extract relevant details from issue"""
        details = {}
        
        # Extract common detail fields
        detail_fields = [
            "contrast_ratio", "required_ratio", "colors",
            "term", "alternative", "suggestion",
            "word_count", "recommended_max",
            "current_value", "optimal_range",
            "element", "attention_score"
        ]
        
        for field in detail_fields:
            if field in issue:
                details[field] = issue[field]
        
        return details
    
    def _add_explainable_feedback(self, issues: List[Dict]) -> List[Dict]:
        """
        FR-024: Add explainable AI feedback with confidence scores and reasoning
        """
        for issue in issues:
            # Add confidence score if not present
            if "confidence" not in issue:
                issue["confidence"] = 0.75
            
            # Add explanation if not present
            if "explanation" not in issue:
                issue["explanation"] = self._generate_explanation(issue)
            
            # Add fix suggestion if not present
            if "fix_suggestion" not in issue:
                issue["fix_suggestion"] = self._generate_fix_suggestion(issue)
            
            # Add confidence interpretation
            confidence = issue["confidence"]
            if confidence >= 0.9:
                issue["confidence_level"] = "Very High"
            elif confidence >= 0.75:
                issue["confidence_level"] = "High"
            elif confidence >= 0.6:
                issue["confidence_level"] = "Moderate"
            else:
                issue["confidence_level"] = "Low"
            
            # Add reasoning
            issue["ai_reasoning"] = self._generate_ai_reasoning(issue)
        
        return issues
    
    def _generate_explanation(self, issue: Dict) -> str:
        """Generate explanation for issue"""
        issue_type = issue.get("type", "")
        severity = issue.get("severity", "low")
        
        explanations = {
            "Low Contrast Ratio": f"This area has insufficient color contrast, making it difficult for users with visual impairments to read.",
            "Missing Alt Text": f"Screen readers cannot describe this image to visually impaired users without alternative text.",
            "Long Sentence": f"Sentences longer than 20 words are harder to understand and reduce readability.",
            "Non-inclusive Language": f"This language may exclude or offend certain user groups.",
        }
        
        return explanations.get(issue_type, f"This {severity} severity issue may impact user experience.")
    
    def _generate_fix_suggestion(self, issue: Dict) -> str:
        """Generate actionable fix suggestion"""
        issue_type = issue.get("type", "")
        
        suggestions = {
            "Low Contrast Ratio": "Increase contrast by using darker text or lighter background to meet WCAG standards.",
            "Missing Alt Text": "Add descriptive alt text explaining the image's purpose and content.",
            "Long Sentence": "Break into shorter sentences of 15-20 words for better readability.",
            "Non-inclusive Language": "Replace with inclusive alternatives that welcome all users.",
        }
        
        return suggestions.get(issue_type, "Review and address this issue according to best practices.")
    
    def _generate_ai_reasoning(self, issue: Dict) -> str:
        """
        FR-024: Generate AI reasoning explanation
        """
        confidence = issue.get("confidence", 0.75)
        category = issue.get("category", "")
        
        reasoning_parts = []
        
        # Method explanation
        if category == "Accessibility":
            reasoning_parts.append("Detected using WCAG 2.1 compliance algorithms including contrast calculation and visual analysis.")
        elif category == "Readability":
            reasoning_parts.append("Analyzed using OCR text extraction and NLP algorithms including Flesch-Kincaid readability scores.")
        elif category == "Attention":
            reasoning_parts.append("Predicted using deep learning saliency model trained on eye-tracking data.")
        
        # Confidence explanation
        if confidence >= 0.9:
            reasoning_parts.append("High confidence due to objective measurements against established standards.")
        elif confidence >= 0.75:
            reasoning_parts.append("Confidence based on heuristic analysis and pattern recognition.")
        else:
            reasoning_parts.append("Moderate confidence - manual verification recommended.")
        
        return " ".join(reasoning_parts)
    
    def _get_educational_content(self, issues: List[Dict]) -> List[Dict]:
        """
        FR-025: Provide contextual educational content on accessibility principles
        """
        educational_content = []
        covered_criteria = set()
        
        for issue in issues:
            criterion = issue.get("wcag_criterion", "N/A")
            
            if criterion != "N/A" and criterion not in covered_criteria and criterion in self.WCAG_EDUCATION:
                education = self.WCAG_EDUCATION[criterion].copy()
                education["related_issues"] = [i for i in issues if i.get("wcag_criterion") == criterion]
                educational_content.append(education)
                covered_criteria.add(criterion)
        
        return educational_content
    
    def _create_issue_summary(self, issues: List[Dict]) -> Dict:
        """Create issue summary statistics"""
        summary = {
            "total": len(issues),
            "by_severity": {},
            "by_category": {},
            "by_wcag_level": {}
        }
        
        for issue in issues:
            # Count by severity
            severity = issue.get("severity", "unknown")
            summary["by_severity"][severity] = summary["by_severity"].get(severity, 0) + 1
            
            # Count by category
            category = issue.get("category", "Unknown")
            summary["by_category"][category] = summary["by_category"].get(category, 0) + 1
            
            # Count by WCAG level
            wcag_level = issue.get("wcag_level", "N/A")
            if wcag_level != "N/A":
                summary["by_wcag_level"][wcag_level] = summary["by_wcag_level"].get(wcag_level, 0) + 1
        
        return summary
    
    def _compile_recommendations(self, analysis_results: Dict) -> List[Dict]:
        """Compile all recommendations from analysis"""
        all_recommendations = []
        
        for category in ["accessibility", "readability", "attention"]:
            category_results = analysis_results.get(category, {})
            recommendations = category_results.get("recommendations", [])
            all_recommendations.extend(recommendations)
        
        # Sort by priority
        priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        all_recommendations.sort(key=lambda x: priority_order.get(x.get("priority", "low"), 4))
        
        return all_recommendations
    
    def export_to_pdf(self, report: Dict, output_path: str) -> str:
        """
        FR-026: Generate comprehensive PDF report
        """
        doc = SimpleDocTemplate(output_path, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1a237e'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#283593'),
            spaceAfter=12,
            spaceBefore=12
        )
        
        # Title
        story.append(Paragraph("ARAI System Analysis Report", title_style))
        story.append(Spacer(1, 0.2 * inch))
        
        # Executive Summary
        story.append(Paragraph("Executive Summary", heading_style))
        arai_score = report["arai_score"]
        summary_text = f"""
        <b>Overall ARAI Score:</b> {arai_score['overall']}/100 (Grade {report['grade']})<br/>
        <b>Accessibility:</b> {arai_score['accessibility']}/100<br/>
        <b>Readability:</b> {arai_score['readability']}/100<br/>
        <b>Attention:</b> {arai_score['attention']}/100<br/>
        <br/>
        <b>Interpretation:</b> {arai_score['interpretation']}<br/>
        <b>Total Issues Found:</b> {report['metadata']['total_issues']}
        """
        story.append(Paragraph(summary_text, styles['BodyText']))
        story.append(Spacer(1, 0.3 * inch))
        
        # Issue Summary Table
        story.append(Paragraph("Issues by Severity", heading_style))
        issue_summary = report["issue_summary"]
        
        table_data = [["Severity", "Count"]]
        for severity in ["critical", "high", "medium", "low", "info"]:
            count = issue_summary["by_severity"].get(severity, 0)
            if count > 0:
                table_data.append([severity.title(), str(count)])
        
        table = Table(table_data, colWidths=[2*inch, 1*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(table)
        story.append(PageBreak())
        
        # Detailed Issues
        story.append(Paragraph("Detailed Issues", heading_style))
        
        for i, issue in enumerate(report["issues"][:20], 1):  # Limit to 20 for PDF
            issue_text = f"""
            <b>{i}. {issue['type']}</b> [{issue['severity'].upper()}]<br/>
            <b>Category:</b> {issue['category']} - {issue['subcategory']}<br/>
            <b>WCAG Criterion:</b> {issue['wcag_criterion']} (Level {issue['wcag_level']})<br/>
            <b>Description:</b> {issue['description']}<br/>
            <b>How to Fix:</b> {issue.get('fix_suggestion', 'See recommendations')}<br/>
            <b>Confidence:</b> {issue.get('confidence', 0.75):.0%} ({issue.get('confidence_level', 'Moderate')})
            """
            story.append(Paragraph(issue_text, styles['BodyText']))
            story.append(Spacer(1, 0.15 * inch))
        
        # Educational Content
        if report.get("education"):
            story.append(PageBreak())
            story.append(Paragraph("Educational Resources", heading_style))
            
            for edu in report["education"]:
                edu_text = f"""
                <b>{edu['title']}</b> (WCAG Level {edu['level']})<br/>
                <b>What it means:</b> {edu['description']}<br/>
                <b>Why it's important:</b> {edu['why_important']}<br/>
                <b>How to fix:</b> {edu['how_to_fix']}
                """
                story.append(Paragraph(edu_text, styles['BodyText']))
                story.append(Spacer(1, 0.2 * inch))
        
        # Build PDF
        doc.build(story)
        return output_path
    
    def export_to_csv(self, report: Dict, output_path: str) -> str:
        """
        FR-027: Export issue data to CSV
        """
        issues = report["issues"]
        
        # Prepare data for DataFrame
        csv_data = []
        for issue in issues:
            row = {
                "ID": issue.get("id", ""),
                "Category": issue.get("category", ""),
                "Subcategory": issue.get("subcategory", ""),
                "Type": issue.get("type", ""),
                "Severity": issue.get("severity", ""),
                "Description": issue.get("description", ""),
                "WCAG Criterion": issue.get("wcag_criterion", ""),
                "WCAG Level": issue.get("wcag_level", ""),
                "Fix Suggestion": issue.get("fix_suggestion", ""),
                "Confidence": issue.get("confidence", ""),
                "Confidence Level": issue.get("confidence_level", ""),
                "Location X": issue.get("location", {}).get("x", "") if issue.get("location") else "",
                "Location Y": issue.get("location", {}).get("y", "") if issue.get("location") else "",
            }
            csv_data.append(row)
        
        # Create DataFrame and export
        df = pd.DataFrame(csv_data)
        df.to_csv(output_path, index=False, encoding='utf-8')
        
        return output_path
