# History Storage Fix - Root Cause Analysis

## Problem
Analyses were not being stored in the history page after image upload, even though the API endpoint was returning correct results.

## Root Cause
The backend `save_analysis_to_db()` function was using an incorrect schema that didn't match the actual Supabase `analyses` table structure.

### Original Issues Found:
1. **Missing column**: The code tried to insert a `results` column that doesn't exist in the table
2. **Wrong column names**: Used `file_path` instead of `design_url`, `created_at`/`updated_at` instead of other timestamp fields
3. **Missing required columns**: The table requires `overall_score` in addition to `arai_score`
4. **Schema mismatch**: The Supabase table had a specific schema that the code didn't match

## Solution
Updated `save_analysis_to_db()` in `/backend/app/core/database.py` to use the correct schema:

### Required Columns (Actual Supabase Schema):
```python
{
    "id": "UUID",                          # Primary key
    "user_id": "UUID",                     # Foreign key to auth.users
    "design_name": "text",                 # Design name
    "design_url": "text",                  # File path/URL
    "accessibility_score": "numeric",      # WCAG score (0-100)
    "readability_score": "numeric",        # Readability score (0-100)
    "attention_score": "numeric",          # Attention score (0-100)
    "arai_score": "numeric",               # ARAI composite score (0-100)
    "overall_score": "numeric",            # Overall score (same as arai_score)
    "overall_grade": "text",               # Grade A-F
    "status": "text"                       # "completed" or "partial"
}
```

## Changes Made

### 1. Fixed `save_analysis_to_db()` Function
**File**: `/backend/app/core/database.py`

- Removed non-existent columns: `results`, `filename`, `created_at`, `updated_at`, `conformance_level`
- Added missing columns: `overall_score`
- Fixed column mapping: `file_path` → `design_url`
- Simplified data extraction to match actual table schema
- Improved error logging with full tracebacks

### 2. Improved Error Handling
**File**: `/backend/app/api/analysis.py` (lines ~358-375)

- Added better error logging with full traceback
- Made error messages more descriptive
- Still allows API to return results even if database save fails (graceful degradation)

## How It Works Now

1. User uploads an image with JWT authentication token
2. Backend receives request with `Authorization: Bearer <token>`
3. `get_current_user()` verifies token and extracts authenticated `user_id`
4. Analysis runs (WCAG, Readability, Attention)
5. ARAI score calculated: `(accessibility * 0.4) + (readability * 0.3) + (attention * 0.3)`
6. `save_analysis_to_db()` saves to Supabase with correct schema:
   - Uses authenticated `user_id` from JWT token (guaranteed to exist in auth.users)
   - Maps results to correct column names
   - Inserts all required fields
7. Frontend calls `GET /api/v1/analysis/history` to retrieve user's analyses
8. Query filters by authenticated user's `user_id` via Supabase admin client
9. History page displays all analyses with scores, grades, and timestamps

## Key Points

✅ **Foreign Key Constraint**: The `user_id` must reference a user in Supabase's `auth.users` table
  - This works automatically when using authenticated JWT tokens
  - Admin client can bypass RLS but still enforces foreign keys

✅ **UUID Fields**: Both `id` and `user_id` must be valid UUIDs
  - Analysis `id` is generated as UUID in backend: `uuid.uuid4()`
  - User `id` comes from Supabase auth token: `current_user.id`

✅ **Required Fields**: All fields in the schema are NOT NULL
  - `accessibility_score`, `readability_score`, `attention_score` default to 0 if missing
  - `overall_grade` defaults to "N/A" if missing
  - `status` defaults to "completed"

## Testing

The fix has been verified with:
1. Database schema discovery - confirmed all required columns
2. Foreign key constraint check - ensures user_id exists in auth.users
3. Error message analysis - captured exact schema validation errors
4. Schema documentation - added comments explaining requirements

## Next Steps for Full Testing

To confirm the complete flow works:
1. Create a test user account in Supabase Authentication
2. Get JWT token for that user
3. Upload an image using the frontend (or `curl` with token header)
4. Verify analysis appears in database: `SELECT * FROM analyses WHERE user_id = '<user_uuid>'`
5. Verify history page loads: `GET /api/v1/analysis/history` with user token
6. Verify frontend displays results in History page

## Files Modified

1. `/backend/app/core/database.py` - Fixed `save_analysis_to_db()` function (lines ~47-102)
2. `/backend/app/api/analysis.py` - Improved error logging (lines ~358-375)
