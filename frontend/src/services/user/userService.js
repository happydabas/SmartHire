import api from '../api/axios';
import { API_ENDPOINTS } from '../api/endpoints';
import { storage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants/storageKeys';

export const userService = {
  getProfile: async () => {
    // 1. Load baseline user from localStorage
    const localUser = storage.getItem(STORAGE_KEYS.USER);
    if (!localUser) {
      throw new Error('Not authenticated');
    }

    // 2. Fetch latest data from backend /auth/me
    const response = await api.get(API_ENDPOINTS.AUTH.ME);
    const apiUser = response.data;

    // 3. Apply local overrides if any
    const profileOverrides = storage.getItem(`profile_override_${apiUser.id}`) || {};

    const merged = {
      ...apiUser,
      name: profileOverrides.name || apiUser.name || localUser.name,
      phone: profileOverrides.phone || apiUser.phone || localUser.phone || '',
      profile_image: profileOverrides.profile_image || apiUser.profile_image || localUser.profile_image || '',
      // Recruiter mock details
      job_title: profileOverrides.job_title || 'Senior Technical Recruiter',
      department: profileOverrides.department || 'Talent Acquisition'
    };

    return merged;
  },

  updateProfile: async (profileData) => {
    const localUser = storage.getItem(STORAGE_KEYS.USER) || {};
    const userId = localUser.id || 999;

    // Save overrides locally
    const overrides = storage.getItem(`profile_override_${userId}`) || {};
    const updatedOverrides = {
      ...overrides,
      name: profileData.name,
      phone: profileData.phone,
      profile_image: profileData.profile_image,
    };
    storage.setItem(`profile_override_${userId}`, updatedOverrides);

    // Update the main cached user object in Auth State
    const updatedUser = {
      ...localUser,
      name: profileData.name,
      phone: profileData.phone,
      profile_image: profileData.profile_image
    };
    storage.setItem(STORAGE_KEYS.USER, updatedUser);

    // Dispatch a custom storage/auth event so other components sync
    window.dispatchEvent(new Event('storage'));

    return updatedUser;
  },

  uploadAvatar: async (file) => {
    return new Promise((resolve, reject) => {
      // Validate type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        reject(new Error('Invalid file type. Only JPG, JPEG, and PNG files are accepted.'));
        return;
      }

      // Validate size (< 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        reject(new Error('File size exceeds the 2MB limit. Please upload a smaller image.'));
        return;
      }

      // Convert to base64 Data URL
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = (err) => {
        reject(new Error('Failed to read image file.'));
      };
    });
  }
};

export default userService;
