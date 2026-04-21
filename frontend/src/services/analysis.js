import api from './api';

export const analysisService = {
  async uploadAndAnalyze(file, designName) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('design_name', designName);

    const response = await api.post('/analysis/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getAnalysis(analysisId) {
    const response = await api.get(`/analysis/results/${analysisId}`);
    return response.data;
  },

  async getHistory(page = 1, limit = 10) {
    const response = await api.get('/analysis/history', {
      params: { page, limit },
    });
    return response.data;
  },

  async getTeamHistory(teamId, page = 1, limit = 100) {
    const response = await api.get(`/teams/${teamId}/analysis-history`, {
      params: { page, limit },
    });
    return response.data;
  },

  async deleteAnalysis(analysisId) {
    try {
      console.log('🗑️ Attempting to delete analysis:', analysisId);
      console.log('API URL:', `${api.defaults.baseURL}/analysis/results/${analysisId}`);
      
      const response = await api.delete(`/analysis/results/${analysisId}`);
      
      console.log('✅ Delete response:', response.data);
      console.log('✅ Status:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ Delete error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method,
      });
      throw error;
    }
  },
};