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
            "filename": filename,
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

        # Core fields guaranteed to be in the schema
        core_fields = {"id", "user_id", "design_name", "design_url", "accessibility_score",
                       "readability_score", "attention_score", "arai_score", "overall_score",
                       "overall_grade", "status"}

        for attempt, excluded in enumerate([set(), {"results"}, {"results", "filename"}], start=1):
            candidate = {k: v for k, v in analysis_data.items() if k not in excluded}
            try:
                response = supabase_admin.table("analyses").insert(candidate).execute()
                logger.info(f"✅ Analysis saved to database (attempt {attempt}): {analysis_id}")
                return response.data[0] if response.data else candidate
            except Exception as insert_error:
                if attempt < 3:
                    logger.warning(f"⚠️ Insert attempt {attempt} failed ({insert_error}), retrying with fewer fields...")
                else:
                    raise

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
            "created_by": user_id,
            "name": project_name,
            "description": project_description or "",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }

        try:
            response = supabase_admin.table("projects").insert(project_data).execute()
        except Exception as insert_error:
            error_message = str(insert_error).lower()

            # Some environments may not have the optional created_by column yet.
            if "created_by" in error_message and (
                "does not exist" in error_message or
                "schema cache" in error_message or
                "column" in error_message
            ):
                logger.warning(
                    "⚠️ Projects insert failed with created_by; retrying without the column"
                )
                fallback_project_data = {
                    key: value
                    for key, value in project_data.items()
                    if key != "created_by"
                }
                response = supabase_admin.table("projects").insert(fallback_project_data).execute()
            else:
                raise
        
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


# ==================== Team Management Functions ====================


async def create_team(
    user_id: str,
    team_name: str,
    team_description: Optional[str] = None
) -> Dict:
    """
    Create a new team
    """
    try:
        team_id = str(uuid.uuid4())
        
        team_data = {
            "id": team_id,
            "name": team_name,
            "description": team_description or "",
            "created_by": user_id,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        response = supabase_admin.table("teams").insert(team_data).execute()
        
        # Add creator as owner
        await add_team_member(team_id, user_id, "owner")
        
        logger.info(f"✅ Team created: {team_id} by user {user_id}")
        return response.data[0] if response.data else team_data
        
    except Exception as e:
        logger.error(f"❌ Error creating team: {str(e)}")
        raise


async def add_team_member(
    team_id: str,
    user_id: str,
    role: str = "member"
) -> Dict:
    """
    Add a user to a team
    """
    try:
        member_data = {
            "id": str(uuid.uuid4()),
            "team_id": team_id,
            "user_id": user_id,
            "role": role,
            "joined_at": datetime.utcnow().isoformat()
        }
        
        response = supabase_admin.table("team_members").insert(member_data).execute()
        
        logger.info(f"✅ User {user_id} added to team {team_id} as {role}")
        return response.data[0] if response.data else member_data
        
    except Exception as e:
        logger.error(f"❌ Error adding team member: {str(e)}")
        raise


async def get_user_teams(user_id: str) -> List[Dict]:
    """
    Get all teams that a user is a member of.
    Queries team_members first (creator is always added as 'owner' member),
    then fetches the corresponding team rows.
    """
    try:
        member_response = supabase_admin.table("team_members") \
            .select("team_id") \
            .eq("user_id", user_id) \
            .execute()

        team_ids = [m["team_id"] for m in member_response.data or []]

        if not team_ids:
            return []

        response = supabase_admin.table("teams") \
            .select("*") \
            .in_("id", team_ids) \
            .execute()

        logger.info(f"✅ Retrieved {len(response.data)} teams for user {user_id}")
        return response.data

    except Exception as e:
        logger.error(f"❌ Error fetching user teams: {str(e)}")
        raise


async def get_team_members(team_id: str) -> List[Dict]:
    """
    Get all members of a team
    """
    try:
        response = supabase_admin.table("team_members") \
            .select("*") \
            .eq("team_id", team_id) \
            .execute()
        
        logger.info(f"✅ Retrieved {len(response.data)} members for team {team_id}")
        return response.data
        
    except Exception as e:
        logger.error(f"❌ Error fetching team members: {str(e)}")
        return []


async def remove_team_member(team_id: str, user_id: str) -> bool:
    """
    Remove a user from a team
    """
    try:
        supabase_admin.table("team_members") \
            .delete() \
            .eq("team_id", team_id) \
            .eq("user_id", user_id) \
            .execute()
        
        logger.info(f"✅ User {user_id} removed from team {team_id}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error removing team member: {str(e)}")
        return False


async def update_team_member_role(team_id: str, user_id: str, role: str) -> bool:
    """
    Update a team member's role
    """
    try:
        supabase_admin.table("team_members") \
            .update({"role": role}) \
            .eq("team_id", team_id) \
            .eq("user_id", user_id) \
            .execute()
        
        logger.info(f"✅ Updated {user_id} role in team {team_id} to {role}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error updating team member role: {str(e)}")
        return False


# ==================== Project Sharing Functions ====================


async def share_project_with_team(
    project_id: str,
    team_id: str,
    access_level: str,
    shared_by: str
) -> Dict:
    """
    Share a project with a team
    """
    try:
        share_id = str(uuid.uuid4())
        
        share_data = {
            "id": share_id,
            "project_id": project_id,
            "team_id": team_id,
            "user_id": None,
            "access_level": access_level,
            "shared_by": shared_by,
            "shared_at": datetime.utcnow().isoformat()
        }
        
        response = supabase_admin.table("project_shares").insert(share_data).execute()
        
        logger.info(f"✅ Project {project_id} shared with team {team_id}")
        return response.data[0] if response.data else share_data
        
    except Exception as e:
        logger.error(f"❌ Error sharing project with team: {str(e)}")
        raise


async def share_project_with_user(
    project_id: str,
    user_id: str,
    access_level: str,
    shared_by: str
) -> Dict:
    """
    Share a project with a specific user
    """
    try:
        share_id = str(uuid.uuid4())
        
        share_data = {
            "id": share_id,
            "project_id": project_id,
            "team_id": None,
            "user_id": user_id,
            "access_level": access_level,
            "shared_by": shared_by,
            "shared_at": datetime.utcnow().isoformat()
        }
        
        response = supabase_admin.table("project_shares").insert(share_data).execute()
        
        logger.info(f"✅ Project {project_id} shared with user {user_id}")
        return response.data[0] if response.data else share_data
        
    except Exception as e:
        logger.error(f"❌ Error sharing project with user: {str(e)}")
        raise


async def get_project_shares(project_id: str) -> List[Dict]:
    """
    Get all shares for a project
    """
    try:
        response = supabase_admin.table("project_shares") \
            .select("*") \
            .eq("project_id", project_id) \
            .execute()
        
        logger.info(f"✅ Retrieved {len(response.data)} shares for project {project_id}")
        return response.data
        
    except Exception as e:
        logger.error(f"❌ Error fetching project shares: {str(e)}")
        return []


async def remove_project_share(share_id: str) -> bool:
    """
    Remove a project share
    """
    try:
        supabase_admin.table("project_shares") \
            .delete() \
            .eq("id", share_id) \
            .execute()
        
        logger.info(f"✅ Removed project share {share_id}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error removing project share: {str(e)}")
        return False


async def get_user_access_level(project_id: str, user_id: str) -> Optional[str]:
    """
    Get the access level of a user for a project
    Returns 'owner', 'editor', 'viewer', or None
    """
    try:
        # Check if user owns the project
        project = await get_project_by_id(project_id)
        if project and project.get("user_id") == user_id:
            return "owner"
        
        # Check direct user share
        response = supabase_admin.table("project_shares") \
            .select("access_level") \
            .eq("project_id", project_id) \
            .eq("user_id", user_id) \
            .execute()
        
        if response.data:
            return response.data[0]["access_level"]
        
        # Check team shares
        response = supabase_admin.table("project_shares") \
            .select("access_level") \
            .eq("project_id", project_id) \
            .neq("team_id", "null") \
            .execute()
        
        team_shares = response.data or []
        
        for share in team_shares:
            team_id = share.get("team_id")
            if team_id:
                # Check if user is in this team
                member = supabase_admin.table("team_members") \
                    .select("*") \
                    .eq("team_id", team_id) \
                    .eq("user_id", user_id) \
                    .execute()
                
                if member.data:
                    return share["access_level"]
        
        return None
        
    except Exception as e:
        logger.error(f"❌ Error getting user access level: {str(e)}")
        return None


async def get_user_shared_projects(user_id: str) -> List[Dict]:
    """
    Get all projects shared with a user (either directly or through teams)
    """
    try:
        shared_projects = []
        
        # Get direct shares
        direct_response = supabase_admin.table("project_shares") \
            .select("*") \
            .eq("user_id", user_id) \
            .execute()
        
        for share in direct_response.data or []:
            project = await get_project_by_id(share["project_id"])
            if project:
                project["access_level"] = share["access_level"]
                shared_projects.append(project)
        
        # Get team shares
        team_response = supabase_admin.table("team_members") \
            .select("team_id") \
            .eq("user_id", user_id) \
            .execute()
        
        team_ids = [member["team_id"] for member in team_response.data or []]
        
        for team_id in team_ids:
            team_shares = supabase_admin.table("project_shares") \
                .select("*") \
                .eq("team_id", team_id) \
                .execute()
            
            for share in team_shares.data or []:
                project = await get_project_by_id(share["project_id"])
                if project:
                    # Check if not already added from direct shares
                    if not any(p["id"] == project["id"] for p in shared_projects):
                        project["access_level"] = share["access_level"]
                        shared_projects.append(project)
        
        logger.info(f"✅ Retrieved {len(shared_projects)} shared projects for user {user_id}")
        return shared_projects
        
    except Exception as e:
        logger.error(f"❌ Error fetching user shared projects: {str(e)}")
        return []


async def get_user_by_email(email: str) -> Optional[Dict]:
    """
    Get user information by email using Supabase Admin API
    Returns user object with id and email, or None if not found
    """
    try:
        # Use Supabase admin API to search for user by email
        users = supabase_admin.auth.admin.list_users()
        
        for user in users:
            if user.email == email:
                return {
                    "id": user.id,
                    "email": user.email,
                    "user_metadata": user.user_metadata or {}
                }
        
        logger.warning(f"⚠️ User not found with email: {email}")
        return None
        
    except Exception as e:
        logger.error(f"❌ Error fetching user by email: {str(e)}")
        return None

