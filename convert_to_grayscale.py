#!/usr/bin/env python3
"""
Convert colored UI elements to grayscale in the frontend components
"""

import re
import os

# Color mapping from colored to grayscale
COLOR_MAPPINGS = {
    # Blue variants
    r'bg-blue-50': 'bg-gray-50',
    r'bg-blue-100': 'bg-gray-100',
    r'bg-blue-200': 'bg-gray-200',
    r'bg-blue-600': 'bg-gray-900',
    r'bg-blue-700': 'bg-gray-900',
    r'border-blue-200': 'border-gray-300',
    r'border-blue-300': 'border-gray-400',
    r'border-blue-600': 'border-gray-900',
    r'text-blue-100': 'text-gray-300',
    r'text-blue-600': 'text-gray-900',
    r'text-blue-700': 'text-gray-900',
    r'text-blue-800': 'text-gray-900',
    
    # Green variants
    r'bg-green-50': 'bg-gray-50',
    r'bg-green-100': 'bg-gray-100',
    r'bg-green-200': 'bg-gray-200',
    r'bg-green-600': 'bg-gray-900',
    r'bg-green-700': 'bg-gray-900',
    r'border-green-200': 'border-gray-300',
    r'border-green-300': 'border-gray-400',
    r'text-green-600': 'text-gray-900',
    r'text-green-700': 'text-gray-900',
    r'text-green-800': 'text-gray-900',
    
    # Purple variants
    r'bg-purple-50': 'bg-gray-50',
    r'bg-purple-100': 'bg-gray-100',
    r'bg-purple-200': 'bg-gray-200',
    r'bg-purple-600': 'bg-gray-900',
    r'border-purple-200': 'border-gray-300',
    r'border-purple-300': 'border-gray-400',
    r'text-purple-600': 'text-gray-900',
    r'text-purple-700': 'text-gray-900',
    
    # Red variants
    r'bg-red-50': 'bg-gray-100',
    r'bg-red-100': 'bg-gray-200',
    r'bg-red-200': 'bg-gray-300',
    r'border-red-200': 'border-gray-400',
    r'border-red-300': 'border-gray-500',
    r'text-red-600': 'text-gray-900',
    r'text-red-700': 'text-gray-900',
    r'text-red-800': 'text-gray-900',
    
    # Orange variants
    r'bg-orange-50': 'bg-gray-100',
    r'bg-orange-100': 'bg-gray-200',
    r'border-orange-200': 'border-gray-400',
    r'text-orange-600': 'text-gray-800',
    r'text-orange-700': 'text-gray-900',
    r'text-orange-800': 'text-gray-900',
    
    # Yellow variants
    r'bg-yellow-50': 'bg-gray-50',
    r'bg-yellow-100': 'bg-gray-100',
    r'border-yellow-200': 'border-gray-300',
    r'text-yellow-600': 'text-gray-700',
    r'text-yellow-700': 'text-gray-800',
    r'text-yellow-800': 'text-gray-900',
    
    # Indigo variants
    r'bg-indigo-50': 'bg-gray-50',
    r'bg-indigo-100': 'bg-gray-100',
    r'border-indigo-200': 'border-gray-300',
    r'border-indigo-600': 'border-gray-900',
    r'text-indigo-600': 'text-gray-900',
    
    # Gradient variants
    r'from-blue-600': 'from-gray-900',
    r'to-purple-600': 'to-gray-800',
    r'from-indigo-50': 'from-gray-50',
    r'to-blue-50': 'to-gray-100',
    r'from-purple-100': 'from-gray-100',
    r'to-blue-100': 'to-gray-200',
}

def convert_file_to_grayscale(filepath):
    """Convert a file from colored to grayscale"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Apply all color mappings
    for color_pattern, grayscale in COLOR_MAPPINGS.items():
        content = re.sub(color_pattern, grayscale, content)
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Converted {filepath}")
        return True
    else:
        print(f"ℹ️  No changes needed in {filepath}")
        return False

# Files to convert
files_to_convert = [
    '/Users/kavishani/Documents/FYP/arai-system/frontend/src/components/Analysis/AnalysisResults.jsx',
]

if __name__ == '__main__':
    converted_count = 0
    for filepath in files_to_convert:
        if os.path.exists(filepath):
            if convert_file_to_grayscale(filepath):
                converted_count += 1
        else:
            print(f"❌ File not found: {filepath}")
    
    print(f"\n✅ Converted {converted_count} file(s) to grayscale")
