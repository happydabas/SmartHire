import api from './api/axios';

export const insightsService = {
  refreshInsights: async () => {
    const response = await api.post('/insights/refresh');
    return response.data;
  },

  getInsightsHistory: async () => {
    const response = await api.get('/insights/history');
    return response.data || [];
  },

  clearInsightsHistory: async () => {
    const response = await api.delete('/insights/history');
    return response.data;
  },

  deleteInsightItem: async (id) => {
    const response = await api.delete(`/insights/history/${id}`);
    return response.data;
  }
};

export default insightsService;
