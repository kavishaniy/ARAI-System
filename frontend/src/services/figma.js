import api from './api';

export const figmaService = {
  async analyzeFrames(frameUrls) {
    const response = await api.post(
      '/figma/analyze-frames',
      { frame_urls: frameUrls },
      { timeout: 300000 }
    );

    return response.data;
  },
};
