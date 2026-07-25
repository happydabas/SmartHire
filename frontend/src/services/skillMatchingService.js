import api from './api/axios';

export const skillMatchingService = {
  calculateSkillMatching: async (jobId, candidateId) => {
    const params = { job_id: jobId };
    if (candidateId) {
      params.candidate_id = candidateId;
    }
    const response = await api.post('/skill-matching/calculate', null, { params });
    return response.data;
  },

  getSkillMatching: async (jobId, candidateId) => {
    const response = await api.get(`/skill-matching/job/${jobId}/candidate/${candidateId}`);
    return response.data;
  }
};

export default skillMatchingService;
