# Figma Analysis Database Setup - Supabase

## Overview
This guide walks you through creating the necessary database tables in Supabase to store Figma analysis results.

---

## 📋 Database Schema

### Table 1: `figma_analyses` (Main Analysis Table)

**Purpose**: Store metadata about each Figma analysis

**SQL:**
```sql
CREATE TABLE figma_analyses (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User & File Info
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  figma_file_id TEXT NOT NULL,
  figma_file_name TEXT NOT NULL,
  figma_file_url TEXT NOT NULL,
  
  -- Analysis Details
  analysis_scope TEXT[] NOT NULL DEFAULT ARRAY['accessibility', 'readability', 'attention'],
  status TEXT NOT NULL DEFAULT 'pending',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Additional Info
  total_pages INTEGER,
  total_frames INTEGER,
  error_message TEXT
);

-- Create index on user_id for faster queries
CREATE INDEX idx_figma_analyses_user_id ON figma_analyses(user_id);
CREATE INDEX idx_figma_analyses_status ON figma_analyses(status);
CREATE INDEX idx_figma_analyses_created_at ON figma_analyses(created_at DESC);
```

---

### Table 2: `figma_scores` (Analysis Scores)

**Purpose**: Store overall scores for each analysis

**SQL:**
```sql
CREATE TABLE figma_scores (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Key
  analysis_id UUID NOT NULL REFERENCES figma_analyses(id) ON DELETE CASCADE,
  
  -- Scores (0-100)
  accessibility_score DECIMAL(5,2),
  readability_score DECIMAL(5,2),
  attention_score DECIMAL(5,2),
  overall_score DECIMAL(5,2),
  
  -- Score Details
  accessibility_details JSONB,
  readability_details JSONB,
  attention_details JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on analysis_id
CREATE INDEX idx_figma_scores_analysis_id ON figma_scores(analysis_id);
```

---

### Table 3: `figma_pages` (Page Results)

**Purpose**: Store results for each page in the Figma file

**SQL:**
```sql
CREATE TABLE figma_pages (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Keys
  analysis_id UUID NOT NULL REFERENCES figma_analyses(id) ON DELETE CASCADE,
  
  -- Page Info
  page_name TEXT NOT NULL,
  page_index INTEGER,
  frame_count INTEGER,
  
  -- Page Scores
  avg_accessibility_score DECIMAL(5,2),
  avg_readability_score DECIMAL(5,2),
  avg_attention_score DECIMAL(5,2),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index
CREATE INDEX idx_figma_pages_analysis_id ON figma_pages(analysis_id);
```

---

### Table 4: `figma_frames` (Frame Results)

**Purpose**: Store detailed results for each frame

**SQL:**
```sql
CREATE TABLE figma_frames (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Keys
  analysis_id UUID NOT NULL REFERENCES figma_analyses(id) ON DELETE CASCADE,
  page_id UUID REFERENCES figma_pages(id) ON DELETE CASCADE,
  
  -- Frame Info
  frame_name TEXT NOT NULL,
  frame_index INTEGER,
  element_count INTEGER,
  
  -- Frame Scores
  accessibility_score DECIMAL(5,2),
  readability_score DECIMAL(5,2),
  attention_score DECIMAL(5,2),
  
  -- Detailed Data
  accessibility_data JSONB,
  readability_data JSONB,
  attention_data JSONB,
  
  -- Issues & Recommendations
  issues JSONB,
  recommendations JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_figma_frames_analysis_id ON figma_frames(analysis_id);
CREATE INDEX idx_figma_frames_page_id ON figma_frames(page_id);
```

---

### Table 5: `figma_analysis_results` (Full Results - JSON)

**Purpose**: Store complete analysis results as JSON for flexibility

**SQL:**
```sql
CREATE TABLE figma_analysis_results (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Key
  analysis_id UUID NOT NULL UNIQUE REFERENCES figma_analyses(id) ON DELETE CASCADE,
  
  -- Full Results (JSON)
  full_results JSONB NOT NULL,
  
  -- Summary
  summary JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index
CREATE INDEX idx_figma_analysis_results_analysis_id ON figma_analysis_results(analysis_id);
```

---

## 🚀 Setup Instructions

### Step 1: Access Supabase Dashboard
1. Go to https://supabase.com
2. Sign in to your project
3. Navigate to **SQL Editor**

### Step 2: Create Tables
1. Click **New Query**
2. Copy and paste each SQL command above (one at a time)
3. Click **Run** for each query

### Step 3: Enable Row Level Security (RLS)

**For each table:**
```sql
-- Enable RLS
ALTER TABLE figma_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE figma_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE figma_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE figma_frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE figma_analysis_results ENABLE ROW LEVEL SECURITY;
```

### Step 4: Create RLS Policies

```sql
-- Users can only see their own analyses
CREATE POLICY "Users can view own figma_analyses" ON figma_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create figma_analyses" ON figma_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own figma_analyses" ON figma_analyses
  FOR UPDATE USING (auth.uid() = user_id);

-- Cascade for scores and related tables
CREATE POLICY "Users can view own figma_scores" ON figma_scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM figma_analyses 
      WHERE figma_analyses.id = figma_scores.analysis_id 
      AND figma_analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own figma_pages" ON figma_pages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM figma_analyses 
      WHERE figma_analyses.id = figma_pages.analysis_id 
      AND figma_analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own figma_frames" ON figma_frames
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM figma_analyses 
      WHERE figma_analyses.id = figma_frames.analysis_id 
      AND figma_analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own figma_analysis_results" ON figma_analysis_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM figma_analyses 
      WHERE figma_analyses.id = figma_analysis_results.analysis_id 
      AND figma_analyses.user_id = auth.uid()
    )
  );
```

---

## 📊 Data Structure Example

### Figma Analysis Request
```json
{
  "figma_url": "https://www.figma.com/file/abc123/MyDesign",
  "analysis_scope": ["accessibility", "readability", "attention"]
}
```

### Stored in Database
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "figma_file_id": "abc123",
  "figma_file_name": "MyDesign",
  "figma_file_url": "https://www.figma.com/file/abc123/MyDesign",
  "analysis_scope": ["accessibility", "readability", "attention"],
  "status": "completed",
  "total_pages": 5,
  "total_frames": 42,
  "created_at": "2026-04-15T10:30:00Z",
  "completed_at": "2026-04-15T10:35:00Z"
}
```

---

## 🔌 Backend Integration

### Python Function to Save Analysis
```python
from supabase import create_client
import json
from datetime import datetime

supabase_url = "YOUR_SUPABASE_URL"
supabase_key = "YOUR_SUPABASE_KEY"
supabase = create_client(supabase_url, supabase_key)

def save_figma_analysis(
    user_id: str,
    figma_url: str,
    figma_file_id: str,
    figma_file_name: str,
    analysis_scope: list,
    results: dict
):
    """Save Figma analysis to database"""
    
    # 1. Create analysis record
    analysis = supabase.table('figma_analyses').insert({
        'user_id': user_id,
        'figma_file_id': figma_file_id,
        'figma_file_name': figma_file_name,
        'figma_file_url': figma_url,
        'analysis_scope': analysis_scope,
        'status': 'completed',
        'total_pages': len(results.get('page_results', [])),
        'total_frames': sum(len(p['frame_results']) for p in results.get('page_results', [])),
        'completed_at': datetime.utcnow().isoformat()
    }).execute()
    
    analysis_id = analysis.data[0]['id']
    
    # 2. Save scores
    overall_score = (
        (results.get('average_accessibility_score', 0) +
         results.get('average_readability_score', 0) +
         results.get('average_attention_score', 0)) / 3
    )
    
    supabase.table('figma_scores').insert({
        'analysis_id': analysis_id,
        'accessibility_score': results.get('average_accessibility_score'),
        'readability_score': results.get('average_readability_score'),
        'attention_score': results.get('average_attention_score'),
        'overall_score': overall_score,
        'accessibility_details': results.get('accessibility_details', {}),
        'readability_details': results.get('readability_details', {}),
        'attention_details': results.get('attention_details', {})
    }).execute()
    
    # 3. Save full results
    supabase.table('figma_analysis_results').insert({
        'analysis_id': analysis_id,
        'full_results': results,
        'summary': {
            'overall_score': overall_score,
            'pages': len(results.get('page_results', [])),
            'frames': sum(len(p['frame_results']) for p in results.get('page_results', []))
        }
    }).execute()
    
    return analysis_id
```

---

## ✅ Verification

### Check if tables exist
```sql
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'figma_%';
```

### Test data insertion
```sql
INSERT INTO figma_analyses (
  user_id, 
  figma_file_id, 
  figma_file_name, 
  figma_file_url, 
  status
) VALUES (
  'your-user-id-here',
  'file123',
  'Test Design',
  'https://www.figma.com/file/123/test',
  'completed'
);
```

---

## 🎯 Next Steps

1. ✅ Create tables using SQL above
2. ✅ Enable RLS policies
3. ✅ Update backend to use Supabase connection
4. ✅ Test database operations
5. ✅ Deploy changes

---

## 📞 Support

If you encounter issues:
- Check Supabase dashboard for errors
- Verify table names and column types
- Ensure RLS policies are correctly configured
- Check auth.users table has your test user

---

**Status**: ✅ Ready for setup
**Last Updated**: April 15, 2026
