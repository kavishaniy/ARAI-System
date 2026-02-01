#!/usr/bin/env python3
"""
Create a sample UI design for testing the analysis
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_sample_design(output_path="sample_design.png"):
    """Create a realistic UI design sample"""
    
    # Create canvas
    width, height = 1200, 800
    img = Image.new('RGB', (width, height), color=(245, 245, 245))
    draw = ImageDraw.Draw(img)
    
    # Try to use a better font, fallback to default
    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 32)
        button_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 20)
        text_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 16)
    except:
        title_font = ImageFont.load_default()
        button_font = ImageFont.load_default()
        text_font = ImageFont.load_default()
    
    # Header bar
    draw.rectangle([0, 0, width, 80], fill=(66, 133, 244))
    draw.text((width//2 - 100, 25), 'ARAI Design System', fill=(255, 255, 255), font=title_font)
    
    # Navigation
    nav_items = ['Home', 'Features', 'Pricing', 'Contact']
    nav_x = width - 500
    for item in nav_items:
        draw.text((nav_x, 30), item, fill=(255, 255, 255), font=text_font)
        nav_x += 120
    
    # Hero Section
    draw.text((100, 150), 'AI-Powered UX Analysis', fill=(33, 33, 33), font=title_font)
    draw.text((100, 200), 'Improve your designs with intelligent feedback', fill=(100, 100, 100), font=text_font)
    
    # Primary CTA Button
    button_width, button_height = 200, 60
    button_x, button_y = 100, 270
    draw.rectangle([button_x, button_y, button_x + button_width, button_y + button_height], 
                   fill=(52, 168, 83), outline=(40, 140, 65), width=2)
    draw.text((button_x + 40, button_y + 18), 'Get Started', fill=(255, 255, 255), font=button_font)
    
    # Secondary Button
    sec_button_x = button_x + button_width + 20
    draw.rectangle([sec_button_x, button_y, sec_button_x + button_width, button_y + button_height], 
                   fill=(255, 255, 255), outline=(200, 200, 200), width=2)
    draw.text((sec_button_x + 40, button_y + 18), 'Learn More', fill=(66, 133, 244), font=button_font)
    
    # Feature Cards
    card_y = 400
    card_width, card_height = 350, 200
    features = [
        ('Saliency Analysis', 'Understand where users look first'),
        ('WCAG Compliance', 'Ensure accessibility standards'),
        ('Smart Reports', 'Get actionable insights')
    ]
    
    for i, (title, desc) in enumerate(features):
        card_x = 50 + i * (card_width + 30)
        
        # Card background
        draw.rectangle([card_x, card_y, card_x + card_width, card_y + card_height],
                      fill=(255, 255, 255), outline=(220, 220, 220), width=1)
        
        # Card content
        draw.text((card_x + 20, card_y + 30), title, fill=(33, 33, 33), font=button_font)
        draw.text((card_x + 20, card_y + 70), desc, fill=(100, 100, 100), font=text_font)
        
        # Icon placeholder
        draw.ellipse([card_x + 20, card_y + 110, card_x + 70, card_y + 160],
                     fill=(234, 67, 53))
    
    # Footer
    draw.rectangle([0, height - 60, width, height], fill=(50, 50, 50))
    draw.text((width//2 - 100, height - 40), '© 2026 ARAI System', fill=(200, 200, 200), font=text_font)
    
    # Save
    img.save(output_path)
    print(f"✅ Sample design created: {output_path}")
    print(f"   Size: {width}x{height}px")
    return output_path


if __name__ == '__main__':
    create_sample_design()
