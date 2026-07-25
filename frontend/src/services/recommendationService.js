import api from './api/axios';

export const recommendationService = {
  refreshRecommendations: async () => {
    const response = await api.post('/recommendations/refresh');
    return response.data;
  },

  getRecommendationHistory: async () => {
    const response = await api.get('/recommendations/history');
    return response.data || [];
  },

  clearRecommendationHistory: async () => {
    const response = await api.delete('/recommendations/history');
    return response.data;
  },

  getSimilarJobs: async (jobId) => {
    const response = await api.get(`/recommendations/job/${jobId}/similar`);
    return response.data || [];
  },

  getTrendingJobs: async () => {
    const response = await api.get('/recommendations/trending');
    return response.data || [];
  },

  getRecruiterRecommendations: async (jobId) => {
    const response = await api.get(`/recommendations/recruiter/job/${jobId}`);
    return response.data;
  }
};

export default recommendationService;
