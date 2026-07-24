import api from '../api/axios';
import { API_ENDPOINTS } from '../api/endpoints';

export const skillsService = {
  getSkillsList: async () => {
    const response = await api.get(API_ENDPOINTS.PROFILE.SKILLS);
    return response.data;
  },

  addSkill: async (skillId) => {
    // Schema expects: { skill_ids: [id] }
    const response = await api.post(API_ENDPOINTS.PROFILE.SKILLS, {
      skill_ids: [skillId]
    });
    return response.data;
  },

  deleteSkill: async (skillId) => {
    const response = await api.delete(`${API_ENDPOINTS.PROFILE.SKILLS}/${skillId}`);
    return response.data;
  }
};

export default skillsService;
