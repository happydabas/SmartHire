import api from './api/axios';

export const matchScoreService = {
  calculateMatchScore: async (jobId, candidateId) => {
    const params = { job_id: jobId };
    if (candidateId) {
      params.candidate_id = candidateId;
    }
    const response = await api.post('/match-score/calculate', null, { params });
    return response.data;
  },

  getMatchScore: async (jobId, candidateId) => {
    const response = await api.get(`/match-score/job/${jobId}/candidate/${candidateId}`);
    return response.data;
  },

  getRankings: async (jobId) => {
    const response = await api.get(`/match-score/job/${jobId}/rankings`);
    return response.data;
  }
};

export default matchScoreService;
