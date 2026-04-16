#!/usr/bin/env python3
"""
Test script to directly test the save_analysis_to_db function
"""
import os
import sys
import asyncio
import uuid
from dotenv import load_dotenv
from datetime import datetime

# Add backend to path
sys.path.insert(0, '/Users/kavishani/Documents/FYP/arai-system/backend')

# Load environment variables
load_dotenv('/Users/kavishani/Documents/FYP/arai-system/backend/.env')

from app.core.database import save_analysis_to_db
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_save_analysis():
    """Test saving an analysis to database"""
    
    # Create test data matching what the API would send
    analysis_id = str(uuid.uuid4())
    user_id = str(uuid.uuid4())
    
    test_analysis = {
        "id": analysis_id,
        "user_id": user_id,
        "design_name": "Test Design",
        "filename": "test.png",
        "file_path": "/uploads/test.png",
        "arai_score": 75.5,
        "overall_grade": "A",
        "accessibility": {
            "score": 75.0,
            "conformance": "WCAG 2.1 AA"
        },
        "readability": {
            "score": 80.0
        },
        "attention": {
            "score": 70.0
        }
    }
    
    try:
        logger.info("🧪 Testing save_analysis_to_db function...")
        logger.info(f"   Analysis ID: {analysis_id}")
        logger.info(f"   User ID: {user_id}")
        
        result = await save_analysis_to_db(
            user_id=user_id,
            analysis_id=analysis_id,
            design_name=test_analysis["design_name"],
            filename=test_analysis["filename"],
            file_path=test_analysis["file_path"],
            results=test_analysis
        )
        logger.info(f"✅ Test passed! Result: {result}")
        
    except Exception as e:
        logger.error(f"❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_save_analysis())
