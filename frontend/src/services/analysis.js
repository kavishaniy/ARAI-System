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
    const response = await api.get(`/analysis/${analysisId}`);
    return response.data;
  },

  async getHistory(page = 1, limit = 10) {
    const response = await api.get('/analysis/history', {
      params: { page, limit },
    });
    return response.data;
  },

  async deleteAnalysis(analysisId) {
    const response = await api.delete(`/analysis/${analysisId}`);
    return response.data;
  },
};