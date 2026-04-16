from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
import logging
from app.models.schemas import ProjectCreate, ProjectUpdate, Project, ProjectList
from app.core.database import (
    create_project,
    get_user_projects,
    get_project_by_id,
    update_project,
    delete_project,
    get_project_analyses,
    link_analysis_to_project,
    supabase_admin
)

router = APIRouter()
logger = logging.getLogger(__name__)


async def get_current_user(authorization: Optional[str] = Header(None)):
    """
    Extract and verify user from JWT token
    """
    if not authorization:
        logger.error("❌ No authorization header")
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        if not authorization.startswith("Bearer "):
            logger.error("❌ Invalid authorization format")
            raise HTTPException(status_code=401, detail="Invalid authorization format")
        
        token = authorization.replace("Bearer ", "")
        
        # Verify token with Supabase
        user_response = supabase_admin.auth.get_user(token)
        
        if not user_response or not user_response.user:
            logger.error("❌ No user in response")
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        
        logger.info(f"✅ Authenticated user: {user_response.user.id}")
        return user_response.user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Authentication error: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/projects", response_model=Project)
async def create_new_project(
    project_data: ProjectCreate,
    current_user = Depends(get_current_user)
):
    """
    Create a new project
    """
    try:
        logger.info(f"📝 Creating project for user {current_user.id}: {project_data.name}")
        
        result = await create_project(
            user_id=str(current_user.id),
            project_name=project_data.name,
            project_description=project_data.description
        )
        
        return Project(
            id=result["id"],
            user_id=result["user_id"],
            name=result["name"],
            description=result.get("description"),
            analysis_count=0,  # New projects have no analyses
            created_at=result["created_at"],
            updated_at=result.get("updated_at")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error creating project: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating project: {str(e)}")


@router.get("/projects", response_model=ProjectList)
async def list_user_projects(
    search: Optional[str] = None,
    limit: int = 100,
    current_user = Depends(get_current_user)
):
    """
    List all projects for the current user
    """
    try:
        logger.info(f"📋 Fetching projects for user {current_user.id}")
        
        projects = await get_user_projects(str(current_user.id), limit=limit)
        
        # Filter by search term if provided
        if search:
            search_lower = search.lower()
            projects = [
                p for p in projects 
                if search_lower in p["name"].lower() or 
                   (p.get("description") and search_lower in p["description"].lower())
            ]
        
        # Convert to response model
        project_list = []
        for p in projects:
            project_list.append(Project(
                id=p["id"],
                user_id=p["user_id"],
                name=p["name"],
                description=p.get("description"),
                analysis_count=p.get("analysis_count", 0),
                created_at=p["created_at"],
                updated_at=p.get("updated_at")
            ))
        
        return ProjectList(projects=project_list, total=len(project_list))
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching projects: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching projects: {str(e)}")


@router.get("/projects/{project_id}")
async def get_project_detail(
    project_id: str,
    current_user = Depends(get_current_user)
):
    """
    Get project details with its analyses
    """
    try:
        logger.info(f"🔍 Fetching project {project_id}")
        
        project = await get_project_by_id(project_id, user_id=str(current_user.id))
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Get project analyses
        analyses = await get_project_analyses(project_id)
        
        return {
            "id": project["id"],
            "user_id": project["user_id"],
            "name": project["name"],
            "description": project.get("description"),
            "analysis_count": len(analyses),
            "analyses": analyses,
            "created_at": project["created_at"],
            "updated_at": project.get("updated_at")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching project detail: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching project: {str(e)}")


@router.put("/projects/{project_id}")
async def update_project_info(
    project_id: str,
    project_data: ProjectUpdate,
    current_user = Depends(get_current_user)
):
    """
    Update project information
    """
    try:
        logger.info(f"✏️ Updating project {project_id}")
        
        # Check if project exists and belongs to user
        project = await get_project_by_id(project_id, user_id=str(current_user.id))
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Prepare update data
        update_data = {}
        if project_data.name is not None:
            update_data["name"] = project_data.name
        if project_data.description is not None:
            update_data["description"] = project_data.description
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        result = await update_project(project_id, str(current_user.id), **update_data)
        
        return {
            "message": "Project updated successfully",
            "project": result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error updating project: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating project: {str(e)}")


@router.delete("/projects/{project_id}")
async def delete_project_endpoint(
    project_id: str,
    current_user = Depends(get_current_user)
):
    """
    Delete a project and its analyses
    """
    try:
        logger.info(f"🗑️ Deleting project {project_id}")
        
        # Check if project exists and belongs to user
        project = await get_project_by_id(project_id, user_id=str(current_user.id))
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        success = await delete_project(project_id, str(current_user.id))
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete project")
        
        return {"message": "Project deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error deleting project: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting project: {str(e)}")


@router.post("/projects/{project_id}/analyses/{analysis_id}")
async def link_analysis_to_project_endpoint(
    project_id: str,
    analysis_id: str,
    current_user = Depends(get_current_user)
):
    """
    Link an analysis to a project
    """
    try:
        logger.info(f"🔗 Linking analysis {analysis_id} to project {project_id}")
        
        # Check if project exists and belongs to user
        project = await get_project_by_id(project_id, user_id=str(current_user.id))
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        success = await link_analysis_to_project(analysis_id, project_id, str(current_user.id))
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to link analysis")
        
        return {"message": "Analysis linked to project successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error linking analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error linking analysis: {str(e)}")
