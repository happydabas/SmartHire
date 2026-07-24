import api from '../api/axios';
import { API_ENDPOINTS } from '../api/endpoints';

export const experienceService = {
  getExperienceList: async () => {
    const response = await api.get(API_ENDPOINTS.PROFILE.EXPERIENCE);
    return response.data;
  },

  createExperience: async (experienceData) => {
    const response = await api.post(API_ENDPOINTS.PROFILE.EXPERIENCE, experienceData);
    return response.data;
  },

  updateExperience: async (id, experienceData) => {
    const response = await api.put(`${API_ENDPOINTS.PROFILE.EXPERIENCE}/${id}`, experienceData);
    return response.data;
  },

  deleteExperience: async (id) => {
    const response = await api.delete(`${API_ENDPOINTS.PROFILE.EXPERIENCE}/${id}`);
    return response.data;
  },
};

export default experienceService;
