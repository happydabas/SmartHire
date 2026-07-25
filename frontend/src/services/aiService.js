import api from './api/axios';

export const aiService = {
  parseResume: async (content) => {
    const response = await api.post('/ai/parse-resume', { content });
    return response.data;
  },

  analyzeResume: async (content) => {
    const response = await api.post('/ai/analyze-resume', { content });
    return response.data;
  },

  calculateMatchScore: async (jobRequirements, resumeDetails) => {
    const response = await api.post('/ai/match-score', {
      job_requirements: jobRequirements,
      resume_details: resumeDetails
    });
    return response.data;
  },

  recommendJobs: async (skills, preferences) => {
    const response = await api.post('/ai/recommend-jobs', {
      skills,
      preferences
    });
    return response.data;
  },

  matchSkills: async (skills, requirements) => {
    const response = await api.post('/ai/match-skills', {
      skills,
      requirements
    });
    return response.data;
  }
};

export default aiService;
