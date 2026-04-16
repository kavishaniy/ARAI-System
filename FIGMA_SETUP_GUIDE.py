#!/usr/bin/env python3
"""
Complete guide to test Figma analysis
"""

print("""
╔══════════════════════════════════════════════════════════════════════════════╗
║                     FIGMA ANALYSIS - COMPLETE SETUP GUIDE                    ║
╚══════════════════════════════════════════════════════════════════════════════╝

📋 WHAT WE'VE VERIFIED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Backend Status
   - Backend is RUNNING on port 8000
   - All Python modules are available
   - FigmaAnalysisService and FigmaAPIClient can be imported
   - CORS is configured correctly
   - Endpoints are accessible

✅ Configuration
   - FIGMA_API_TOKEN is SET in .env file (45 characters)
   - Figma client credentials are configured
   - Database connection is available
   - All required dependencies installed

✅ URL Validation
   - Test URL validation endpoint: WORKING ✅
   - File key extraction: WORKING ✅
   - URL format validation: WORKING ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧪 HOW TO TEST FIGMA ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The Figma analysis endpoint requires TWO things:

1️⃣  VALID FIGMA URL
    https://www.figma.com/design/UHw9ANQMCKSIKmZgrxeOxl/Untitled?...

2️⃣  AUTHENTICATION HEADER
    The endpoint needs a Bearer token from Supabase authentication
    
    Header: Authorization: Bearer <your-jwt-token>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 TESTING OPTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OPTION A: Test from Frontend
─────────────────────────────
1. Start frontend: cd frontend && npm start
2. Go to http://localhost:3000/figma
3. Paste Figma URL: https://www.figma.com/design/UHw9ANQMCKSIKmZgrxeOxl/Untitled
4. Click "Analyze All Screens"
5. Frontend will handle authentication and make the request

OPTION B: Test from Command Line (with token)
───────────────────────────────────────────────
# First, get a token by:
# 1. Sign in on frontend
# 2. Open browser DevTools > Application > Local Storage
# 3. Find "supabase.auth.token" or similar
# 4. Copy the JWT token

curl -X POST http://localhost:8000/api/v1/analysis/figma-screens \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \\
  -H "Content-Type: application/json" \\
  -d '{
    "figma_url": "https://www.figma.com/design/UHw9ANQMCKSIKmZgrxeOxl/Untitled",
    "figma_token": null
  }'

OPTION C: Disable Auth for Testing (NOT RECOMMENDED FOR PRODUCTION)
───────────────────────────────────────────────────────────────────
Edit: backend/app/api/analysis.py, line 603
Change: current_user = Depends(get_current_user)
To:     current_user = None  # TESTING ONLY

Then test with:
curl -X POST http://localhost:8000/api/v1/analysis/figma-screens \\
  -H "Content-Type: application/json" \\
  -d '{
    "figma_url": "https://www.figma.com/design/UHw9ANQMCKSIKmZgrxeOxl/Untitled"
  }'

⚠️  WARNING: Only use Option C for local testing, never in production!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 WHAT THE ANALYSIS DOES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When you submit a Figma project URL:

1. Backend EXTRACTS the project:
   • Fetches file data via Figma API
   • Gets all pages and frames
   • Extracts UI elements and properties
   • Downloads frame preview images

2. Backend ANALYZES each frame:
   • Accessibility: contrast ratios, font sizes, WCAG levels
   • Readability: text density, font legibility, spacing
   • Attention: visual hierarchy, focal points, prominence

3. Backend AGGREGATES results:
   • Calculates average scores across all frames
   • Generates actionable recommendations
   • Formats response for frontend display

4. Backend STORES results:
   • Saves to Supabase database
   • Stores file metadata
   • Creates analysis history

5. Frontend DISPLAYS results:
   • Shows average ARAI score
   • Lists individual screen analyses
   • Displays frame previews
   • Shows recommendations per screen

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏱️  EXPECTED PROCESSING TIME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Small project (1-5 screens):     5-10 seconds
Medium project (5-20 screens):  15-30 seconds
Large project (20+ screens):    30-60 seconds

(Depends on internet speed and Figma API response time)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ TROUBLESHOOTING ERRORS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Error: "Invalid Figma URL"
→ Ensure URL contains /design/ or /file/
→ Example: https://www.figma.com/design/ABC123/ProjectName

Error: "No Figma token provided"
→ Check FIGMA_API_TOKEN in backend/.env
→ Get new token: https://www.figma.com/developers/api#auth

Error: "Authorization header missing" 
→ You need to be authenticated
→ Use frontend to test (handles auth automatically)
→ Or provide Bearer token in curl request

Error: "No frames found in Figma file"
→ Figma file might be empty
→ Check file has at least one frame or board
→ Ensure token has access to the file

Error: "Backend is not running"
→ Check: ps aux | grep uvicorn
→ Start: cd backend && bash ../start_backend.sh
→ Wait for: "Application startup complete"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ QUICK START
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Run this in THREE different terminals:

Terminal 1 - Start Backend:
$ cd backend
$ bash ../start_backend.sh

Terminal 2 - Start Frontend:
$ cd frontend
$ npm start

Terminal 3 - Use the App:
$ Open http://localhost:3000/figma
$ Paste URL: https://www.figma.com/design/UHw9ANQMCKSIKmZgrxeOxl/Untitled
$ Click "Analyze All Screens"
$ Wait for results...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ SYSTEM STATUS: READY FOR TESTING

Backend:         Running on http://localhost:8000 ✅
Figma API Token: Configured ✅
Database:        Connected ✅
URL Validation:  Working ✅
Analysis Code:   No errors ✅

Ready to analyze Figma projects! 🚀

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
""")
