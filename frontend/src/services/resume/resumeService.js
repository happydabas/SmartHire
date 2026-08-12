import api from '../api/axios';
import { API_ENDPOINTS } from '../api/endpoints';

export const resumeService = {
  getResumeMetadata: async () => {
    const response = await api.get(API_ENDPOINTS.PROFILE.RESUME);
    return response.data;
  },

  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(API_ENDPOINTS.PROFILE.RESUME, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.put(API_ENDPOINTS.PROFILE.RESUME, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteResume: async () => {
    const response = await api.delete(API_ENDPOINTS.PROFILE.RESUME);
    return response.data;
  },

  getResumeFileUrl: async () => {
    const response = await api.get('/profile/resume/file', {
      responseType: 'blob',
      params: { nocache: Date.now() }
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  },

  downloadResume: async (fileName = 'resume.pdf') => {
    const response = await api.get('/profile/resume/file', {
      responseType: 'blob',
      params: { nocache: Date.now() }
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  },

  parseResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/resume-parser/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  analyzeResume: async () => {
    const response = await api.post('/resume-analysis/run');
    return response.data;
  }
};

export default resumeService;
