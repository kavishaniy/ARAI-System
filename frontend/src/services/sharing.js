import api from './api';

// ==================== Team Service ====================

const TEAM_ENDPOINTS = {
  CREATE: '/teams',
  LIST: '/teams',
  GET: (teamId) => `/teams/${teamId}`,
  ADD_MEMBER: (teamId) => `/teams/${teamId}/members`,
  UPDATE_MEMBER: (teamId, userId) => `/teams/${teamId}/members/${userId}`,
  REMOVE_MEMBER: (teamId, userId) => `/teams/${teamId}/members/${userId}`,
};

export const teamService = {
  /**
   * Create a new team
   */
  async createTeam(name, description = '') {
    try {
      const response = await api.post(TEAM_ENDPOINTS.CREATE, {
        name,
        description,
      });
      console.log('✅ Team created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating team:', error);
      throw error;
    }
  },

  /**
   * Get all teams for current user
   */
  async getTeams() {
    try {
      const response = await api.get(TEAM_ENDPOINTS.LIST);
      console.log('✅ Teams fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching teams:', error);
      throw error;
    }
  },

  /**
   * Get a specific team
   */
  async getTeam(teamId) {
    try {
      const response = await api.get(TEAM_ENDPOINTS.GET(teamId));
      console.log('✅ Team fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching team:', error);
      throw error;
    }
  },

  /**
   * Add a member to a team
   */
  async addTeamMember(teamId, userId, role = 'member') {
    try {
      const response = await api.post(
        `${TEAM_ENDPOINTS.ADD_MEMBER(teamId)}?user_id=${userId}&role=${role}`,
        {}
      );
      console.log('✅ Team member added:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error adding team member:', error);
      throw error;
    }
  },

  /**
   * Invite a member to a team by email
   */
  async inviteTeamMember(teamId, email, role = 'member') {
    try {
      const response = await api.post(
        `${TEAM_ENDPOINTS.ADD_MEMBER(teamId).replace('/members', '/invite')}?email=${encodeURIComponent(email)}&role=${role}`,
        {}
      );
      console.log('✅ Team member invited:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error inviting team member:', error);
      throw error;
    }
  },

  /**
   * Update a team member's role
   */
  async updateTeamMemberRole(teamId, userId, role) {
    try {
      const response = await api.put(
        `${TEAM_ENDPOINTS.UPDATE_MEMBER(teamId, userId)}?role=${role}`
      );
      console.log('✅ Team member role updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating team member role:', error);
      throw error;
    }
  },

  /**
   * Remove a member from a team
   */
  async removeTeamMember(teamId, userId) {
    try {
      const response = await api.delete(TEAM_ENDPOINTS.REMOVE_MEMBER(teamId, userId));
      console.log('✅ Team member removed:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error removing team member:', error);
      throw error;
    }
  },
};

// ==================== Sharing Service ====================

const SHARING_ENDPOINTS = {
  SHARE_PROJECT: (projectId) => `/projects/${projectId}/share`,
  GET_SHARES: (projectId) => `/projects/${projectId}/shares`,
  REMOVE_SHARE: (projectId, shareId) => `/projects/${projectId}/shares/${shareId}`,
  GET_SHARED_PROJECTS: '/projects/shared',
};

export const sharingService = {
  /**
   * Share a project with teams and/or users
   */
  async shareProject(projectId, teamIds = [], userEmails = [], accessLevel = 'viewer') {
    try {
      const response = await api.post(SHARING_ENDPOINTS.SHARE_PROJECT(projectId), {
        team_ids: teamIds,
        user_emails: userEmails,
        access_level: accessLevel,
      });
      console.log('✅ Project shared:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error sharing project:', error);
      throw error;
    }
  },

  /**
   * Get all shares for a project
   */
  async getProjectShares(projectId) {
    try {
      const response = await api.get(SHARING_ENDPOINTS.GET_SHARES(projectId));
      console.log('✅ Project shares fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching project shares:', error);
      throw error;
    }
  },

  /**
   * Remove a project share
   */
  async removeProjectShare(projectId, shareId) {
    try {
      const response = await api.delete(SHARING_ENDPOINTS.REMOVE_SHARE(projectId, shareId));
      console.log('✅ Project share removed:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error removing project share:', error);
      throw error;
    }
  },

  /**
   * Get all projects shared with current user
   */
  async getSharedProjects() {
    try {
      const response = await api.get(SHARING_ENDPOINTS.GET_SHARED_PROJECTS);
      console.log('✅ Shared projects fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching shared projects:', error);
      throw error;
    }
  },
};

const sharingServices = { teamService, sharingService };
export default sharingServices;
