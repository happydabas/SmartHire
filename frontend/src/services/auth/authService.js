import api from '../api/axios';
import { API_ENDPOINTS } from '../api/endpoints';

export const authService = {
  login: async (credentials) => {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  },

  refreshToken: async (tokenData) => {
    const response = await api.post(API_ENDPOINTS.AUTH.REFRESH, tokenData);
    return response.data;
  },
};
export default authService;
