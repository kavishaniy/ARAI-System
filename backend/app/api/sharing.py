from fastapi import APIRouter, HTTPException, Depends, Header, Query
from typing import Optional
import logging
from app.models.schemas import (
    TeamCreate, Team, TeamList, TeamMember,
    ProjectShareCreate, ProjectShare, ProjectWithShares,
    ShareProject
)
from app.core.database import (
    create_team,
    add_team_member,
    get_user_teams,
    get_team_members,
    remove_team_member,
    update_team_member_role,
    share_project_with_team,
    share_project_with_user,
    get_project_shares,
    remove_project_share,
    get_user_access_level,
    get_user_shared_projects,
    get_project_by_id,
    get_user_by_email,
    supabase_admin
)
from app.services.email import send_collaboration_invite

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


# ==================== Team Endpoints ====================

@router.post("/teams", response_model=Team)
async def create_new_team(
    team_data: TeamCreate,
    current_user = Depends(get_current_user)
):
    """
    Create a new team
    """
    try:
        logger.info(f"📝 Creating team for user {current_user.id}: {team_data.name}")
        
        result = await create_team(
            user_id=str(current_user.id),
            team_name=team_data.name,
            team_description=team_data.description
        )
        
        members = await get_team_members(result["id"])
        
        return Team(
            id=result["id"],
            name=result["name"],
            description=result.get("description"),
            created_by=result["created_by"],
            members=[],
            created_at=result["created_at"],
            updated_at=result.get("updated_at")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error creating team: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating team: {str(e)}")


@router.get("/teams", response_model=TeamList)
async def list_user_teams(
    current_user = Depends(get_current_user)
):
    """
    List all teams that the user is a member of
    """
    try:
        logger.info(f"📋 Fetching teams for user {current_user.id}")
        
        teams = await get_user_teams(str(current_user.id))
        
        # Enhance with members
        team_list = []
        for team in teams:
            members = await get_team_members(team["id"])
            team_list.append(Team(
                id=team["id"],
                name=team["name"],
                description=team.get("description"),
                created_by=team["created_by"],
                members=[
                    TeamMember(
                        id=m["id"],
                        user_id=m["user_id"],
                        email="",  # Would need to fetch from auth
                        role=m["role"],
                        joined_at=m["joined_at"]
                    ) for m in members
                ],
                created_at=team["created_at"],
                updated_at=team.get("updated_at")
            ))
        
        return TeamList(teams=team_list, total=len(team_list))
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching teams: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching teams: {str(e)}")


@router.get("/teams/{team_id}", response_model=Team)
async def get_team_details(
    team_id: str,
    current_user = Depends(get_current_user)
):
    """
    Get details of a specific team
    """
    try:
        logger.info(f"📋 Fetching team details for {team_id}")
        
        # Get team members to verify user is a member
        members = await get_team_members(team_id)
        current_member = next((m for m in members if m["user_id"] == str(current_user.id)), None)
        
        if not current_member:
            raise HTTPException(status_code=403, detail="You are not a member of this team")
        
        # Get team from database
        teams = await get_user_teams(str(current_user.id))
        team = next((t for t in teams if t["id"] == team_id), None)
        
        if not team:
            raise HTTPException(status_code=404, detail="Team not found")
        
        return Team(
            id=team["id"],
            name=team["name"],
            description=team.get("description"),
            created_by=team["created_by"],
            members=[
                TeamMember(
                    id=m["id"],
                    user_id=m["user_id"],
                    email="",
                    role=m["role"],
                    joined_at=m["joined_at"]
                ) for m in members
            ],
            created_at=team["created_at"],
            updated_at=team.get("updated_at")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching team: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching team: {str(e)}")


@router.post("/teams/{team_id}/members")
async def add_member_to_team(
    team_id: str,
    user_id: str = Query(...),
    role: str = Query("member"),
    current_user = Depends(get_current_user)
):
    """
    Add a user to a team (must be team owner/admin)
    """
    try:
        logger.info(f"➕ Adding user {user_id} to team {team_id}")
        
        # Verify current user is team admin/owner
        members = await get_team_members(team_id)
        current_member = next((m for m in members if m["user_id"] == str(current_user.id)), None)
        
        if not current_member or current_member["role"] not in ["owner", "admin"]:
            raise HTTPException(status_code=403, detail="Only team owners/admins can add members")
        
        result = await add_team_member(team_id, user_id, role)
        
        return {"message": "User added to team successfully", "member": result}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error adding team member: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error adding team member: {str(e)}")


@router.post("/teams/{team_id}/invite")
async def invite_member_by_email(
    team_id: str,
    email: str = Query(...),
    role: str = Query("member"),
    current_user = Depends(get_current_user)
):
    """
    Invite a user to a team by email address (must be team owner/admin)
    Looks up the user by email and adds them to the team.
    If user doesn't exist yet, sends invitation email for them to sign up.
    """
    try:
        logger.info(f"📧 Inviting {email} to team {team_id}")
        
        # Verify current user is team admin/owner
        members = await get_team_members(team_id)
        current_member = next((m for m in members if m["user_id"] == str(current_user.id)), None)
        
        if not current_member or current_member["role"] not in ["owner", "admin"]:
            raise HTTPException(status_code=403, detail="Only team owners/admins can invite members")
        
        # Look up user by email
        user = await get_user_by_email(email)
        
        if not user:
            # User doesn't exist yet - send them an invitation email to sign up first
            logger.info(f"📧 User {email} doesn't exist yet, sending invitation to sign up")
            
            try:
                await send_collaboration_invite(
                    to_email=email,
                    project_name="team invitation",
                    inviter_email=current_user.email or str(current_user.id),
                    user_exists=False,
                )
                logger.info(f"✅ Invitation email sent to {email} to sign up and join team")
                return {
                    "message": f"Invitation sent to {email}. They'll be added to the team once they sign up.",
                    "user_email": email,
                    "status": "pending_signup",
                    "note": "The user will be automatically added to the team after they create an account."
                }
            except Exception as email_err:
                logger.warning(f"⚠️ Failed to send invitation email: {str(email_err)}")
                return {
                    "message": f"User {email} not found in the system. They need to sign up first.",
                    "user_email": email,
                    "status": "not_found",
                    "error": "Could not send invitation email. Please check the email address."
                }
        
        # Check if user is already a member
        existing_member = next((m for m in members if m["user_id"] == user["id"]), None)
        
        if existing_member:
            raise HTTPException(status_code=400, detail="User is already a member of this team")
        
        # Add user to team
        result = await add_team_member(team_id, user["id"], role)

        # Send invitation email (non-blocking — failure doesn't abort the request)
        await send_collaboration_invite(
            to_email=email,
            project_name=f"team invitation",
            inviter_email=current_user.email or str(current_user.id),
            user_exists=True,
        )

        logger.info(f"✅ Successfully invited {email} to team {team_id}")
        return {
            "message": f"User {email} invited to team successfully",
            "member": result,
            "user": {
                "id": user["id"],
                "email": user["email"]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error inviting member: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error inviting member: {str(e)}")


@router.put("/teams/{team_id}/members/{user_id}")
async def update_member_role(
    team_id: str,
    user_id: str,
    role: str = Query(...),
    current_user = Depends(get_current_user)
):
    """
    Update a team member's role (must be team owner)
    """
    try:
        logger.info(f"✏️ Updating role for user {user_id} in team {team_id}")
        
        # Verify current user is team owner
        members = await get_team_members(team_id)
        current_member = next((m for m in members if m["user_id"] == str(current_user.id)), None)
        
        if not current_member or current_member["role"] != "owner":
            raise HTTPException(status_code=403, detail="Only team owners can update member roles")
        
        success = await update_team_member_role(team_id, user_id, role)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update member role")
        
        return {"message": "Member role updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error updating member role: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating member role: {str(e)}")


@router.delete("/teams/{team_id}/members/{user_id}")
async def remove_member_from_team(
    team_id: str,
    user_id: str,
    current_user = Depends(get_current_user)
):
    """
    Remove a user from a team
    """
    try:
        logger.info(f"➖ Removing user {user_id} from team {team_id}")
        
        # Verify current user is team owner/admin or is removing themselves
        members = await get_team_members(team_id)
        current_member = next((m for m in members if m["user_id"] == str(current_user.id)), None)
        
        if not current_member or (current_member["role"] not in ["owner", "admin"] and str(current_user.id) != user_id):
            raise HTTPException(status_code=403, detail="You don't have permission to remove this member")
        
        success = await remove_team_member(team_id, user_id)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to remove member")
        
        return {"message": "Member removed from team successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error removing team member: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error removing team member: {str(e)}")


# ==================== Project Sharing Endpoints ====================

@router.post("/projects/{project_id}/share")
async def share_project(
    project_id: str,
    share_data: ShareProject,
    current_user = Depends(get_current_user)
):
    """
    Share a project with teams and/or users
    """
    try:
        logger.info(f"🔗 Sharing project {project_id} by user {current_user.id}")
        
        # Verify user owns the project
        project = await get_project_by_id(project_id)
        if not project or str(project["user_id"]) != str(current_user.id):
            raise HTTPException(status_code=403, detail="You don't own this project")
        
        shares = []
        
        # Share with teams
        for team_id in share_data.team_ids or []:
            try:
                share = await share_project_with_team(
                    project_id=project_id,
                    team_id=str(team_id),
                    access_level=share_data.access_level,
                    shared_by=str(current_user.id)
                )
                shares.append(share)
            except Exception as e:
                logger.error(f"❌ Error sharing with team {team_id}: {str(e)}")
        
        # Share with users (by email)
        inviter_email = current_user.email or str(current_user.id)
        project_name = project.get("name", "a project")

        for email in share_data.user_emails or []:
            try:
                # Look up user by email using the correct Supabase admin API
                user = await get_user_by_email(email)

                if user:
                    share = await share_project_with_user(
                        project_id=project_id,
                        user_id=user["id"],
                        access_level=share_data.access_level,
                        shared_by=str(current_user.id)
                    )
                    shares.append(share)
                    # Notify existing user about the shared project
                    await send_collaboration_invite(
                        to_email=email,
                        project_name=project_name,
                        inviter_email=inviter_email,
                        user_exists=True,
                    )
                else:
                    # User hasn't signed up yet — send a sign-up invitation
                    await send_collaboration_invite(
                        to_email=email,
                        project_name=project_name,
                        inviter_email=inviter_email,
                        user_exists=False,
                    )
                    logger.info(f"📧 Invitation sent to unregistered email: {email}")
            except Exception as e:
                logger.error(f"❌ Error sharing with user {email}: {str(e)}")
        
        return {
            "message": "Project shared successfully",
            "shares": shares
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error sharing project: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error sharing project: {str(e)}")


@router.get("/projects/{project_id}/shares")
async def get_project_shares_endpoint(
    project_id: str,
    current_user = Depends(get_current_user)
):
    """
    Get all shares for a project
    """
    try:
        logger.info(f"🔍 Fetching shares for project {project_id}")
        
        # Verify user owns the project or has access
        project = await get_project_by_id(project_id)
        access_level = await get_user_access_level(project_id, str(current_user.id))
        
        if not project or not access_level:
            raise HTTPException(status_code=404, detail="Project not found")
        
        shares = await get_project_shares(project_id)
        
        return {
            "project_id": project_id,
            "shares": shares,
            "total": len(shares)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching project shares: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching project shares: {str(e)}")


@router.delete("/projects/{project_id}/shares/{share_id}")
async def remove_share(
    project_id: str,
    share_id: str,
    current_user = Depends(get_current_user)
):
    """
    Remove a share from a project
    """
    try:
        logger.info(f"🗑️ Removing share {share_id} from project {project_id}")
        
        # Verify user owns the project
        project = await get_project_by_id(project_id)
        if not project or str(project["user_id"]) != str(current_user.id):
            raise HTTPException(status_code=403, detail="You don't own this project")
        
        success = await remove_project_share(share_id)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to remove share")
        
        return {"message": "Share removed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error removing share: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error removing share: {str(e)}")


@router.get("/projects/shared")
async def get_shared_projects(
    current_user = Depends(get_current_user)
):
    """
    Get all projects shared with the current user
    """
    try:
        logger.info(f"📋 Fetching shared projects for user {current_user.id}")
        
        shared_projects = await get_user_shared_projects(str(current_user.id))
        
        return {
            "projects": shared_projects,
            "total": len(shared_projects)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching shared projects: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching shared projects: {str(e)}")
