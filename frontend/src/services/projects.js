import api from './api';

const PROJECT_ENDPOINTS = {
  CREATE: '/projects',
  LIST: '/projects',
  GET: (projectId) => `/projects/${projectId}`,
  UPDATE: (projectId) => `/projects/${projectId}`,
  DELETE: (projectId) => `/projects/${projectId}`,
  LINK_ANALYSIS: (projectId, analysisId) => `/projects/${projectId}/analyses/${analysisId}`,
};

export const projectService = {
  /**
   * Create a new project
   */
  async createProject(name, description = '') {
    try {
      const response = await api.post(PROJECT_ENDPOINTS.CREATE, {
        name,
        description,
      });
      console.log('✅ Project created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating project:', error);
      throw error;
    }
  },

  /**
   * Get all projects for current user
   */
  async getProjects(search = '', limit = 100) {
    try {
      const response = await api.get(PROJECT_ENDPOINTS.LIST, {
        params: {
          search: search || undefined,
          limit,
        },
      });
      console.log('✅ Projects fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching projects:', error);
      throw error;
    }
  },

  /**
   * Get a specific project with its analyses
   */
  async getProjectDetail(projectId) {
    try {
      const response = await api.get(PROJECT_ENDPOINTS.GET(projectId));
      console.log('✅ Project detail fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching project detail:', error);
      throw error;
    }
  },

  /**
   * Update project information
   */
  async updateProject(projectId, updates) {
    try {
      const response = await api.put(PROJECT_ENDPOINTS.UPDATE(projectId), updates);
      console.log('✅ Project updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating project:', error);
      throw error;
    }
  },

  /**
   * Delete a project
   */
  async deleteProject(projectId) {
    try {
      const response = await api.delete(PROJECT_ENDPOINTS.DELETE(projectId));
      console.log('✅ Project deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting project:', error);
      throw error;
    }
  },

  /**
   * Link an analysis to a project
   */
  async linkAnalysisToProject(projectId, analysisId) {
    try {
      const response = await api.post(
        PROJECT_ENDPOINTS.LINK_ANALYSIS(projectId, analysisId)
      );
      console.log('✅ Analysis linked to project:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error linking analysis:', error);
      throw error;
    }
  },
};

export default projectService;
