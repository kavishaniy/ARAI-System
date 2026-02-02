#!/bin/bash

# Script to convert all color classes to grayscale in the frontend

cd /Users/kavishani/Documents/FYP/arai-system/frontend/src

# Function to convert colors in a file
convert_file() {
    local file=$1
    
    # Background colors
    sed -i '' 's/bg-blue-/bg-gray-/g' "$file"
    sed -i '' 's/bg-green-/bg-gray-/g' "$file"
    sed -i '' 's/bg-purple-/bg-gray-/g' "$file"
    sed -i '' 's/bg-red-/bg-gray-/g' "$file"
    sed -i '' 's/bg-yellow-/bg-gray-/g' "$file"
    sed -i '' 's/bg-indigo-/bg-gray-/g' "$file"
    sed -i '' 's/bg-orange-/bg-gray-/g' "$file"
    sed -i '' 's/bg-pink-/bg-gray-/g' "$file"
    sed -i '' 's/bg-teal-/bg-gray-/g' "$file"
    sed -i '' 's/bg-cyan-/bg-gray-/g' "$file"
    
    # Text colors
    sed -i '' 's/text-blue-/text-gray-/g' "$file"
    sed -i '' 's/text-green-/text-gray-/g' "$file"
    sed -i '' 's/text-purple-/text-gray-/g' "$file"
    sed -i '' 's/text-red-/text-gray-/g' "$file"
    sed -i '' 's/text-yellow-/text-gray-/g' "$file"
    sed -i '' 's/text-indigo-/text-gray-/g' "$file"
    sed -i '' 's/text-orange-/text-gray-/g' "$file"
    sed -i '' 's/text-pink-/text-gray-/g' "$file"
    sed -i '' 's/text-teal-/text-gray-/g' "$file"
    sed -i '' 's/text-cyan-/text-gray-/g' "$file"
    
    # Border colors
    sed -i '' 's/border-blue-/border-gray-/g' "$file"
    sed -i '' 's/border-green-/border-gray-/g' "$file"
    sed -i '' 's/border-purple-/border-gray-/g' "$file"
    sed -i '' 's/border-red-/border-gray-/g' "$file"
    sed -i '' 's/border-yellow-/border-gray-/g' "$file"
    sed -i '' 's/border-indigo-/border-gray-/g' "$file"
    sed -i '' 's/border-orange-/border-gray-/g' "$file"
    sed -i '' 's/border-pink-/border-gray-/g' "$file"
    sed -i '' 's/border-teal-/border-gray-/g' "$file"
    sed -i '' 's/border-cyan-/border-gray-/g' "$file"
    
    # Hover states
    sed -i '' 's/hover:bg-blue-/hover:bg-gray-/g' "$file"
    sed -i '' 's/hover:bg-green-/hover:bg-gray-/g' "$file"
    sed -i '' 's/hover:bg-purple-/hover:bg-gray-/g' "$file"
    sed -i '' 's/hover:bg-red-/hover:bg-gray-/g' "$file"
    sed -i '' 's/hover:bg-yellow-/hover:bg-gray-/g' "$file"
    sed -i '' 's/hover:bg-indigo-/hover:bg-gray-/g' "$file"
    sed -i '' 's/hover:bg-orange-/hover:bg-gray-/g' "$file"
    
    echo "Converted: $file"
}

# Convert all JSX files
find components -name "*.jsx" -type f | while read file; do
    convert_file "$file"
done

echo "All files converted to grayscale!"
