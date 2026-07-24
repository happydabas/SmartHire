import api from '../api/axios';
import { API_ENDPOINTS } from '../api/endpoints';

export const educationService = {
  getEducationList: async () => {
    const response = await api.get(API_ENDPOINTS.PROFILE.EDUCATION);
    return response.data;
  },

  createEducation: async (educationData) => {
    const response = await api.post(API_ENDPOINTS.PROFILE.EDUCATION, educationData);
    return response.data;
  },

  updateEducation: async (id, educationData) => {
    const response = await api.put(`${API_ENDPOINTS.PROFILE.EDUCATION}/${id}`, educationData);
    return response.data;
  },

  deleteEducation: async (id) => {
    const response = await api.delete(`${API_ENDPOINTS.PROFILE.EDUCATION}/${id}`);
    return response.data;
  },
};

export default educationService;
