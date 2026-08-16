import api from '../api/axios';
import { API_ENDPOINTS } from '../api/endpoints';

export const companyService = {
  // 1. Create new company profile (Onboarding)
  createCompany: async (companyData) => {
    const response = await api.post(API_ENDPOINTS.COMPANY.BASE, companyData);
    return response.data;
  },

  // 2. Fetch company profile details
  getCompany: async (companyId) => {
    if (!companyId) {
      return companyService.getMyCompany();
    }
    const response = await api.get(`${API_ENDPOINTS.COMPANY.BASE}/${companyId}`);
    return response.data;
  },

  getMyCompany: async () => {
    const response = await api.get(`${API_ENDPOINTS.COMPANY.BASE}/me`);
    return response.data;
  },

  // 3. Update company profile details
  updateCompany: async (companyId, companyData) => {
    const response = await api.put(`${API_ENDPOINTS.COMPANY.BASE}/${companyId}`, companyData);
    return response.data;
  },

  // 4. List recruiters belonging to the company
  getRecruiters: async (companyId) => {
    const response = await api.get(`${API_ENDPOINTS.COMPANY.BASE}/${companyId}/recruiters`);
    return response.data;
  },

  // 5. Remove a recruiter from the company
  removeRecruiter: async (companyId, recruiterId) => {
    const response = await api.delete(`${API_ENDPOINTS.COMPANY.BASE}/${companyId}/recruiters/${recruiterId}`);
    return response.data;
  },

  // 6. List invitations sent by the company
  getInvitations: async (companyId) => {
    const response = await api.get(`${API_ENDPOINTS.COMPANY.BASE}/${companyId}/invitations`);
    return response.data;
  },

  // 7. Send recruiter invitation
  sendInvitation: async (companyId, recruiterEmail) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : undefined;
    const response = await api.post(`${API_ENDPOINTS.COMPANY.BASE}/${companyId}/invitations`, {
      recruiter_email: recruiterEmail,
      frontend_url: origin
    });
    return response.data;
  },

  // 8. Cancel pending recruiter invitation
  cancelInvitation: async (companyId, invitationId) => {
    const response = await api.delete(`${API_ENDPOINTS.COMPANY.BASE}/${companyId}/invitations/${invitationId}`);
    return response.data;
  },

  // 9. Inspect invitation token details
  getInvitationDetails: async (token) => {
    const response = await api.get(`/invitations/${token}`);
    return response.data;
  },

  // 10. Accept recruiter invitation
  acceptInvitation: async (payload) => {
    const response = await api.post('/invitations/accept', payload);
    return response.data;
  },

  // 11. Upload company logo helper
  uploadLogo: async (file) => {
    return new Promise((resolve, reject) => {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        reject(new Error('Invalid file type. Only JPG, JPEG, and PNG files are accepted.'));
        return;
      }
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        reject(new Error('File size exceeds the 2MB limit. Please upload a smaller image.'));
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read image file.'));
    });
  }
};

export default companyService;
