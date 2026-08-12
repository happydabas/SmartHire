import api from '../api/axios';
import { API_ENDPOINTS } from '../api/endpoints';

export const jobService = {
  getOpenJobs: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.JOBS.BASE, { params });
    return response.data;
  },

  createJob: async (jobData) => {
    const response = await api.post(API_ENDPOINTS.JOBS.BASE, jobData);
    return response.data;
  },

  getJobDetails: async (jobId) => {
    const response = await api.get(`${API_ENDPOINTS.JOBS.BASE}/${jobId}`);
    return response.data;
  },

  updateJob: async (jobId, jobData) => {
    const response = await api.put(`${API_ENDPOINTS.JOBS.BASE}/${jobId}`, jobData);
    return response.data;
  },

  closeJob: async (jobId) => {
    const response = await api.patch(`${API_ENDPOINTS.JOBS.BASE}/${jobId}/close`);
    return response.data;
  },

  publishJob: async (jobId) => {
    const response = await api.patch(`${API_ENDPOINTS.JOBS.BASE}/${jobId}/publish`);
    return response.data;
  },

  deleteJob: async (jobId) => {
    const response = await api.delete(`${API_ENDPOINTS.JOBS.BASE}/${jobId}`);
    return response.data;
  },

  searchJobs: async (query) => {
    const response = await api.get(`${API_ENDPOINTS.JOBS.BASE}/search`, {
      params: { q: query }
    });
    return response.data;
  },

  getSavedJobs: async () => {
    const response = await api.get(API_ENDPOINTS.SAVED_JOBS.BASE);
    return response.data;
  },

  saveJob: async (jobId) => {
    const response = await api.post(`${API_ENDPOINTS.SAVED_JOBS.BASE}/${jobId}`);
    return response.data;
  },

  unsaveJob: async (jobId) => {
    const response = await api.delete(`${API_ENDPOINTS.SAVED_JOBS.BASE}/${jobId}`);
    return response.data;
  },

  updateJobAssignments: async (jobId, recruiterIds) => {
    const response = await api.put(`${API_ENDPOINTS.JOBS.BASE}/${jobId}/assignments`, {
      recruiter_ids: recruiterIds
    });
    return response.data;
  },
};

export default jobService;
