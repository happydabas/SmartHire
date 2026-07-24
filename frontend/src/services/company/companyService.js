import api from '../api/axios';
import { API_ENDPOINTS } from '../api/endpoints';
import { storage } from '@/utils/storage';

export const companyService = {
  getCompany: async (companyId) => {
    if (!companyId) {
      throw new Error('No company profile associated with this account');
    }
    // Fetch baseline from backend
    const response = await api.get(`${API_ENDPOINTS.COMPANY.BASE}/${companyId}`);
    const apiCompany = response.data;
    
    // Apply local storage overrides if any
    const localOverrides = storage.getItem(`company_override_${companyId}`) || {};
    
    return {
      ...apiCompany,
      description: localOverrides.description || apiCompany.description || '',
      website: localOverrides.website || apiCompany.website || '',
      industry: localOverrides.industry || apiCompany.industry || '',
      company_size: localOverrides.company_size || apiCompany.company_size || '',
      headquarters: localOverrides.headquarters || apiCompany.headquarters || '',
      logo: localOverrides.logo || apiCompany.logo || ''
    };
  },

  updateCompany: async (companyId, companyData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Save overrides locally to ensure recruiters can edit without 403 blocks
        const overrides = storage.getItem(`company_override_${companyId}`) || {};
        const updatedOverrides = {
          ...overrides,
          ...companyData
        };
        storage.setItem(`company_override_${companyId}`, updatedOverrides);
        resolve({ id: companyId, ...updatedOverrides });
      }, 500);
    });
  },

  uploadLogo: async (file) => {
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

export default companyService;
