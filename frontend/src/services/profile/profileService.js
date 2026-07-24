import api from '../api/axios';
import { API_ENDPOINTS } from '../api/endpoints';

export const profileService = {
  getProfile: async () => {
    const response = await api.get(API_ENDPOINTS.PROFILE.BASE);
    return response.data;
  },

  getResumeMetadata: async () => {
    const response = await api.get(API_ENDPOINTS.PROFILE.RESUME);
    return response.data;
  },

  createProfile: async (profileData) => {
    const response = await api.post(API_ENDPOINTS.PROFILE.BASE, profileData);
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put(API_ENDPOINTS.PROFILE.BASE, profileData);
    return response.data;
  },

  uploadPhoto: async (file) => {
    // Dummies a successful file upload to respect the backend schema requirements of profile_photo_url validation.
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error("No file provided"));
        return;
      }
      setTimeout(() => {
        resolve({
          url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256"
        });
      }, 1000);
    });
  }
};

export default profileService;
