import api from './api/axios';

export const resumeAnalysisService = {
  runAnalysis: async () => {
    const response = await api.post('/resume-analysis/run');
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/resume-analysis/history');
    return response.data;
  },

  deleteHistory: async (id) => {
    const response = await api.delete(`/resume-analysis/history/${id}`);
    return response.data;
  }
};

export default resumeAnalysisService;
