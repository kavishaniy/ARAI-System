"""
Database utilities for Supabase operations
Handles analysis history and file storage
"""
from supabase import create_client, Client
from app.core.config import settings
from typing import Optional, List, Dict
from datetime import datetime
import logging
import uuid

logger = logging.getLogger(__name__)

# Initialize Supabase clients
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
supabase_admin: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


async def upload_design_to_storage(
    user_id: str,
    file_path: str,
    file_name: str
) -> str:
    """
    Upload design file to Supabase Storage
    Returns the public/signed URL
    """
    try:
        # Read file
        with open(file_path, 'rb') as f:
            file_data = f.read()
        
        # Upload to Supabase Storage
        # Path format: user_id/timestamp_filename
        storage_path = f"{user_id}/{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file_name}"
        
        response = supabase_admin.storage.from_('design-uploads').upload(
            path=storage_path,
            file=file_data,
            file_options={"content-type": "image/png"}
        )
        
        # Get public URL (valid for authenticated users only)
        url_response = supabase_admin.storage.from_('design-uploads').get_public_url(storage_path)
        
        logger.info(f"✅ File uploaded to storage: {storage_path}")
        return storage_path
        
    except Exception as e:
        logger.error(f"❌ Error uploading to storage: {str(e)}")
        raise


async def save_analysis_to_db(
    user_id: str,
    analysis_id: str,
    design_name: str,
    filename: str,
    file_path: str,
    results: Dict,
    project_id: Optional[str] = None
) -> Dict:
    """
    Save analysis results to the analyses table
    
    Note: The actual Supabase schema has these required columns:
    - id (UUID)
    - user_id (UUID) 
    - design_name (text)
    - design_url (text)
    - accessibility_score (numeric)
    - readability_score (numeric)
    - attention_score (numeric)
    - arai_score (numeric)
    - overall_score (numeric)
    - overall_grade (text)
    - status (text)
    """
    try:
        logger.info(f"💾 Attempting to save analysis: {analysis_id} for user: {user_id}")
        
        # Extract key metrics from results
        overall_score = results.get("arai_score", 0)
        
        analysis_data = {
            "id": analysis_id,
            "user_id": user_id,
            "design_name": design_name,
            "design_url": file_path,  # Use file_path as the design_url
            "accessibility_score": results.get("accessibility", {}).get("score", 0),
            "readability_score": results.get("readability", {}).get("score", 0),
            "attention_score": results.get("attention", {}).get("score", 0),
            "arai_score": results.get("arai_score", 0),
            "overall_score": overall_score,  # Same as arai_score
            "overall_grade": results.get("overall_grade", "N/A"),
            "status": "completed",
            "results": results,
        }
        
        # Add project_id if provided
        if project_id:
            analysis_data["project_id"] = project_id
            logger.info(f"📁 Analysis will be linked to project: {project_id}")
        else:
            logger.warning(f"⚠️ No project_id provided for analysis {analysis_id}")
        
        logger.info(f"📋 Analysis data prepared: {analysis_data}")
        
        # Insert into database using admin client to bypass RLS during API calls
        logger.info(f"🔄 Inserting into 'analyses' table...")
        response = supabase_admin.table("analyses").insert(analysis_data).execute()
        
        logger.info(f"✅ Analysis saved to database: {analysis_id}")
        logger.info(f"📝 Inserted data: {response.data}")
        logger.info(f"📝 Response data: {response.data}")
        return response.data[0] if response.data else analysis_data
        
    except Exception as e:
        logger.error(f"❌ Error saving analysis to database: {str(e)}")
        logger.error(f"📌 Exception type: {type(e).__name__}")
        import traceback
        logger.error(f"📌 Full traceback: {traceback.format_exc()}")
        raise


async def get_user_analyses(user_id: str, limit: int = 50) -> List[Dict]:
    """
    Get all analyses for a specific user
    """
    try:
        response = supabase_admin.table("analyses") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .limit(limit) \
            .execute()
        
        logger.info(f"✅ Retrieved {len(response.data)} analyses for user {user_id}")
        return response.data
        
    except Exception as e:
        logger.error(f"❌ Error fetching user analyses: {str(e)}")
        raise


async def get_analysis_by_id(analysis_id: str, user_id: Optional[str] = None) -> Optional[Dict]:
    """
    Get a specific analysis by ID
    Optionally filter by user_id for security
    """
    try:
        query = supabase_admin.table("analyses").select("*").eq("id", analysis_id)
        
        if user_id:
            query = query.eq("user_id", user_id)
        
        response = query.single().execute()
        
        logger.info(f"✅ Retrieved analysis: {analysis_id}")
        return response.data
        
    except Exception as e:
        logger.error(f"❌ Error fetching analysis: {str(e)}")
        return None


async def delete_analysis(analysis_id: str, user_id: str) -> bool:
    """
    Delete an analysis and its associated file from storage
    """
    try:
        # Get analysis to find file path
        analysis = await get_analysis_by_id(analysis_id, user_id)
        
        if not analysis:
            return False
        
        # Delete from storage if file path exists
        if analysis.get("file_path"):
            try:
                supabase_admin.storage.from_('design-uploads').remove([analysis["file_path"]])
                logger.info(f"✅ Deleted file from storage: {analysis['file_path']}")
            except Exception as storage_error:
                logger.warning(f"⚠️ Could not delete file from storage: {storage_error}")
        
        # Delete from database
        supabase_admin.table("analyses").delete().eq("id", analysis_id).eq("user_id", user_id).execute()
        
        logger.info(f"✅ Deleted analysis: {analysis_id}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error deleting analysis: {str(e)}")
        return False


async def update_analysis_status(analysis_id: str, status: str, error_message: Optional[str] = None):
    """
    Update the status of an analysis (pending, processing, completed, failed)
    """
    try:
        update_data = {
            "status": status,
            "updated_at": datetime.now().isoformat()
        }
        
        if error_message:
            update_data["results"] = {"error": error_message}
        
        supabase_admin.table("analyses").update(update_data).eq("id", analysis_id).execute()
        
        logger.info(f"✅ Updated analysis status: {analysis_id} -> {status}")
        
    except Exception as e:
        logger.error(f"❌ Error updating analysis status: {str(e)}")
        raise


# ==================== Figma Integration Functions ====================


async def save_figma_analysis_to_db(
    analysis_id: str,
    user_id: str,
    figma_url: str,
    analysis_data: Dict
) -> Dict:
    """
    Save Figma analysis results to the database.
    
    Args:
        analysis_id: Unique analysis identifier
        user_id: User who initiated the analysis
        figma_url: Original Figma URL
        analysis_data: Complete analysis results dict
    """
    try:
        file_key = analysis_data.get("file_key", "unknown")
        file_name = analysis_data.get("file_name", "Untitled")
        
        # Extract summary metrics
        avg_accessibility = analysis_data.get("average_accessibility_score")
        avg_readability = analysis_data.get("average_readability_score")
        avg_attention = analysis_data.get("average_attention_score")
        
        # Calculate overall score
        scores = [s for s in [avg_accessibility, avg_readability, avg_attention] if s is not None]
        overall_score = sum(scores) / len(scores) if scores else None
        
        db_record = {
            "id": analysis_id,
            "user_id": user_id,
            "file_key": file_key,
            "file_name": file_name,
            "figma_url": figma_url,
            "status": "completed",
            "accessibility_score": avg_accessibility,
            "readability_score": avg_readability,
            "attention_score": avg_attention,
            "overall_score": overall_score,
            "analysis_data": analysis_data,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # Insert or update in figma_analyses table
        response = supabase_admin.table("figma_analyses").insert(db_record).execute()
        
        logger.info(f"✅ Figma analysis saved: {analysis_id}")
        return response.data[0] if response.data else db_record
    
    except Exception as e:
        logger.error(f"❌ Error saving Figma analysis: {str(e)}")
        raise


async def get_figma_analysis_from_db(analysis_id: str) -> Optional[Dict]:
    """
    Retrieve a Figma analysis from the database.
    """
    try:
        response = supabase_admin.table("figma_analyses") \
            .select("*") \
            .eq("id", analysis_id) \
            .single() \
            .execute()
        
        logger.info(f"✅ Retrieved Figma analysis: {analysis_id}")
        return response.data
    
    except Exception as e:
        logger.warning(f"⚠️ Could not retrieve Figma analysis: {str(e)}")
        return None


async def get_user_figma_analyses(user_id: str, limit: int = 50) -> List[Dict]:
    """
    Get all Figma analyses for a user.
    """
    try:
        response = supabase_admin.table("figma_analyses") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .limit(limit) \
            .execute()
        
        logger.info(f"✅ Retrieved {len(response.data)} Figma analyses for user {user_id}")
        return response.data
    
    except Exception as e:
        logger.error(f"❌ Error fetching user Figma analyses: {str(e)}")
        raise


async def delete_figma_analysis(analysis_id: str, user_id: str) -> bool:
    """
    Delete a Figma analysis from the database.
    """
    try:
        response = supabase_admin.table("figma_analyses") \
            .delete() \
            .eq("id", analysis_id) \
            .eq("user_id", user_id) \
            .execute()
        
        logger.info(f"✅ Deleted Figma analysis: {analysis_id}")
        return True
    
    except Exception as e:
        logger.error(f"❌ Error deleting Figma analysis: {str(e)}")
        return False


# ==================== Project Management Functions ====================


async def create_project(
    user_id: str,
    project_name: str,
    project_description: Optional[str] = None
) -> Dict:
    """
    Create a new project for a user
    """
    try:
        project_id = str(uuid.uuid4())
        
        project_data = {
            "id": project_id,
            "user_id": user_id,
            "name": project_name,
            "description": project_description or "",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        response = supabase_admin.table("projects").insert(project_data).execute()
        
        logger.info(f"✅ Project created: {project_id} for user {user_id}")
        return response.data[0] if response.data else project_data
        
    except Exception as e:
        logger.error(f"❌ Error creating project: {str(e)}")
        raise


async def get_user_projects(user_id: str, limit: int = 100) -> List[Dict]:
    """
    Get all projects for a specific user with analysis count
    """
    try:
        response = supabase_admin.table("projects") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .limit(limit) \
            .execute()
        
        logger.info(f"✅ Retrieved {len(response.data)} projects for user {user_id}")
        
        # Enhance with analysis count
        projects_with_count = []
        for project in response.data:
            try:
                analyses = await get_project_analyses(project["id"])
                project["analysis_count"] = len(analyses)
            except:
                project["analysis_count"] = 0
            projects_with_count.append(project)
        
        return projects_with_count
        
    except Exception as e:
        logger.error(f"❌ Error fetching user projects: {str(e)}")
        raise


async def get_project_by_id(project_id: str, user_id: Optional[str] = None) -> Optional[Dict]:
    """
    Get a specific project by ID
    """
    try:
        query = supabase_admin.table("projects").select("*").eq("id", project_id)
        
        if user_id:
            query = query.eq("user_id", user_id)
        
        response = query.single().execute()
        
        logger.info(f"✅ Retrieved project: {project_id}")
        return response.data
        
    except Exception as e:
        logger.error(f"❌ Error fetching project: {str(e)}")
        return None


async def update_project(
    project_id: str,
    user_id: str,
    **kwargs
) -> Optional[Dict]:
    """
    Update project details (name, description, etc.)
    """
    try:
        update_data = {
            **kwargs,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        response = supabase_admin.table("projects") \
            .update(update_data) \
            .eq("id", project_id) \
            .eq("user_id", user_id) \
            .execute()
        
        logger.info(f"✅ Project updated: {project_id}")
        return response.data[0] if response.data else None
        
    except Exception as e:
        logger.error(f"❌ Error updating project: {str(e)}")
        raise


async def delete_project(project_id: str, user_id: str) -> bool:
    """
    Delete a project and its associated analyses
    """
    try:
        # Delete associated analyses
        analyses = await get_project_analyses(project_id)
        for analysis in analyses:
            await delete_analysis(analysis["id"], user_id)
        
        # Delete project
        supabase_admin.table("projects") \
            .delete() \
            .eq("id", project_id) \
            .eq("user_id", user_id) \
            .execute()
        
        logger.info(f"✅ Project deleted: {project_id}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error deleting project: {str(e)}")
        return False


async def get_project_analyses(project_id: str, limit: int = 100) -> List[Dict]:
    """
    Get all analyses within a project
    """
    try:
        logger.info(f"🔍 Fetching analyses for project: {project_id}")
        response = supabase_admin.table("analyses") \
            .select("*") \
            .eq("project_id", project_id) \
            .order("created_at", desc=True) \
            .limit(limit) \
            .execute()
        
        logger.info(f"✅ Retrieved {len(response.data)} analyses for project {project_id}")
        if len(response.data) > 0:
            logger.info(f"📊 First analysis: {response.data[0]}")
        return response.data
        
    except Exception as e:
        logger.error(f"❌ Error fetching project analyses: {str(e)}")
        import traceback
        logger.error(f"📌 Traceback: {traceback.format_exc()}")
        return []


async def link_analysis_to_project(analysis_id: str, project_id: str, user_id: str) -> bool:
    """
    Associate an analysis with a project
    """
    try:
        supabase_admin.table("analyses") \
            .update({"project_id": project_id}) \
            .eq("id", analysis_id) \
            .eq("user_id", user_id) \
            .execute()
        
        logger.info(f"✅ Analysis {analysis_id} linked to project {project_id}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error linking analysis to project: {str(e)}")
        return False
