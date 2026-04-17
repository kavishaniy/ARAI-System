#!/usr/bin/env python3
"""
Test script to verify analyses are being stored with project_id
"""
import os
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))
os.chdir(str(backend_path))

from app.core.config import settings
from app.core.database import supabase_admin
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_analyses_with_project():
    """Test if we can retrieve analyses for a specific project"""
    try:
        # First, let's see all analyses in the database
        logger.info("📋 Fetching all analyses from database...")
        all_analyses = supabase_admin.table("analyses").select("id, user_id, design_name, project_id, created_at").execute()
        
        logger.info(f"✅ Found {len(all_analyses.data)} total analyses")
        
        if all_analyses.data:
            logger.info("\n📊 Sample analyses:")
            for analysis in all_analyses.data[:5]:
                logger.info(f"  ID: {analysis.get('id')}")
                logger.info(f"  Design: {analysis.get('design_name')}")
                logger.info(f"  Project ID: {analysis.get('project_id')}")
                logger.info(f"  Created: {analysis.get('created_at')}")
                logger.info("  ---")
        
        # Now test filtering by project_id
        logger.info("\n🔍 Testing project filtering...")
        
        # Get unique project IDs
        project_ids = set()
        for analysis in all_analyses.data:
            if analysis.get('project_id'):
                project_ids.add(analysis.get('project_id'))
        
        logger.info(f"Found {len(project_ids)} unique project IDs")
        
        if project_ids:
            test_project_id = list(project_ids)[0]
            logger.info(f"\n🔗 Testing with project ID: {test_project_id}")
            
            project_analyses = supabase_admin.table("analyses") \
                .select("*") \
                .eq("project_id", test_project_id) \
                .execute()
            
            logger.info(f"✅ Found {len(project_analyses.data)} analyses for this project")
            
            for analysis in project_analyses.data[:3]:
                logger.info(f"  - {analysis.get('design_name')} (ID: {analysis.get('id')})")
        else:
            logger.warning("⚠️ No analyses have a project_id set!")
            logger.info("\n💡 This means analyses are being saved WITHOUT the project_id field")
            logger.info("   Check the upload form to ensure project_id is being sent")
        
    except Exception as e:
        logger.error(f"❌ Error: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())

if __name__ == "__main__":
    test_analyses_with_project()
