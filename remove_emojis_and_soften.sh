#!/bin/bash

# Script to remove emojis and soften colors (no pure black)

cd /Users/kavishani/Documents/FYP/arai-system/frontend/src

# Function to process a file
process_file() {
    local file=$1
    
    # Remove common emojis - using more comprehensive patterns
    sed -i '' 's/🛡️//g' "$file"
    sed -i '' 's/🛡//g' "$file"
    sed -i '' 's/📖//g' "$file"
    sed -i '' 's/👁️//g' "$file"
    sed -i '' 's/👁//g' "$file"
    sed -i '' 's/🎯//g' "$file"
    sed -i '' 's/✓//g' "$file"
    sed -i '' 's/✅//g' "$file"
    sed -i '' 's/❌//g' "$file"
    sed -i '' 's/⚠️//g' "$file"
    sed -i '' 's/⚠//g' "$file"
    sed -i '' 's/💡//g' "$file"
    sed -i '' 's/🔍//g' "$file"
    sed -i '' 's/📊//g' "$file"
    sed -i '' 's/🎉//g' "$file"
    sed -i '' 's/👍//g' "$file"
    sed -i '' 's/👆//g' "$file"
    sed -i '' 's/👉//g' "$file"
    sed -i '' 's/👇//g' "$file"
    sed -i '' 's/😊//g' "$file"
    sed -i '' 's/😐//g' "$file"
    sed -i '' 's/😕//g' "$file"
    sed -i '' 's/🎓//g' "$file"
    sed -i '' 's/💬//g' "$file"
    sed -i '' 's/📏//g' "$file"
    sed -i '' 's/🟢//g' "$file"
    sed -i '' 's/🟡//g' "$file"
    sed -i '' 's/🔴//g' "$file"
    sed -i '' 's/📚//g' "$file"
    sed -i '' 's/✂️//g' "$file"
    sed -i '' 's/📝//g' "$file"
    sed -i '' 's/👀//g' "$file"
    sed -i '' 's/🧠//g' "$file"
    sed -i '' 's/⚡//g' "$file"
    sed -i '' 's/📐//g' "$file"
    sed -i '' 's/🎨//g' "$file"
    sed -i '' 's/⬜//g' "$file"
    
    # Replace black (gray-900) with softer dark gray (gray-800)
    sed -i '' 's/bg-gray-900/bg-gray-800/g' "$file"
    sed -i '' 's/text-gray-900/text-gray-800/g' "$file"
    sed -i '' 's/border-gray-900/border-gray-700/g' "$file"
    sed -i '' 's/from-gray-900/from-gray-800/g' "$file"
    
    # Replace pure black text with dark gray
    sed -i '' 's/text-black/text-gray-800/g' "$file"
    sed -i '' 's/bg-black/bg-gray-800/g' "$file"
    
    echo "Processed: $file"
}

# Process all JSX files
find components -name "*.jsx" -type f | while read file; do
    process_file "$file"
done

echo "All emojis removed and colors softened!"
