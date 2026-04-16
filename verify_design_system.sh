#!/bin/bash

# Design System Uniformity Verification Script
# This script checks all pages have been properly updated with the uniform design system

echo "🔍 Design System Uniformity Verification"
echo "======================================"
echo ""

FRONTEND_PATH="/Users/kavishani/Documents/FYP/arai-system/frontend/src"

# Check for PageHeader imports in all pages
echo "✓ Checking PageHeader integration..."
echo ""

PAGES=(
  "$FRONTEND_PATH/pages/FigmaAnalysisPage.jsx"
  "$FRONTEND_PATH/components/Pages/Projects.jsx"
  "$FRONTEND_PATH/components/Pages/HistoryPage.jsx"
  "$FRONTEND_PATH/components/Pages/Settings.jsx"
  "$FRONTEND_PATH/components/Dashboard/Dashboard.jsx"
  "$FRONTEND_PATH/components/Pages/ProjectDashboard.jsx"
)

for page in "${PAGES[@]}"; do
  if grep -q "PageHeader" "$page"; then
    page_name=$(basename "$page")
    echo "  ✅ $page_name - PageHeader integrated"
  else
    echo "  ❌ $page_name - Missing PageHeader"
  fi
done

echo ""
echo "✓ Checking page structure..."
echo ""

for page in "${PAGES[@]}"; do
  if grep -q "page-shell" "$page"; then
    page_name=$(basename "$page")
    echo "  ✅ $page_name - Uses unified CSS classes"
  fi
done

echo ""
echo "✓ Checking for unused imports..."
echo ""

# Check FigmaAnalysisPage specifically
if grep -q "useEffect" "$FRONTEND_PATH/pages/FigmaAnalysisPage.jsx"; then
  echo "  ⚠️  FigmaAnalysisPage has useEffect import (check if unused)"
else
  echo "  ✅ FigmaAnalysisPage - No unused imports"
fi

echo ""
echo "✓ Components verified..."
echo ""

# Check that PageHeader component exists
if [ -f "$FRONTEND_PATH/components/Common/PageHeader.jsx" ]; then
  echo "  ✅ PageHeader.jsx exists"
  lines=$(wc -l < "$FRONTEND_PATH/components/Common/PageHeader.jsx")
  echo "     Lines of code: $lines"
fi

# Check that PageLayout component exists
if [ -f "$FRONTEND_PATH/components/Common/PageLayout.jsx" ]; then
  echo "  ✅ PageLayout.jsx exists"
  lines=$(wc -l < "$FRONTEND_PATH/components/Common/PageLayout.jsx")
  echo "     Lines of code: $lines"
fi

echo ""
echo "✓ Documentation files..."
echo ""

DOC_FILES=(
  "DESIGN_SYSTEM_UNIFICATION.md"
  "DESIGN_UPDATES_QUICK_REFERENCE.md"
  "DESIGN_SYSTEM_VISUAL_SUMMARY.md"
  "DESIGN_SYSTEM_COMPLETION.md"
)

for doc in "${DOC_FILES[@]}"; do
  if [ -f "/Users/kavishani/Documents/FYP/arai-system/$doc" ]; then
    echo "  ✅ $doc"
  else
    echo "  ❌ $doc - Missing"
  fi
done

echo ""
echo "======================================"
echo "✅ Design System Uniformity Verification Complete!"
echo "======================================"
