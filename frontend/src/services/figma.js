import api from './api';

export const figmaService = {
  async getFrames(fileId, figmaToken) {
    const response = await api.post('/figma/frames', {
      file_id: fileId,
      figma_token: figmaToken,
    });
    return response.data;
  },

  async analyzeFrames(fileId, figmaToken, frames, projectUrl) {
    const response = await api.post('/figma/analyze', {
      file_id: fileId,
      figma_token: figmaToken,
      frames: frames,
      project_url: projectUrl,
    });
    return response.data;
  },
};
