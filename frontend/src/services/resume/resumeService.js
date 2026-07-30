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

  downloadResume: async (fileName = 'resume.pdf') => {
    // Generate a valid mock PDF Blob to satisfy frontend downloads
    const pdfContent = new Uint8Array([
      0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, 0x25, 0xd0, 0xd4, 0xc5, 0xd8, 0x0a, 0x34,
      0x20, 0x30, 0x20, 0x6f, 0x62, 0x6a, 0x0a, 0x3c, 0x3c, 0x2f, 0x54, 0x79, 0x70, 0x65, 0x2f, 0x43,
      0x61, 0x74, 0x61, 0x6c, 0x6f, 0x67, 0x2f, 0x50, 0x61, 0x67, 0x65, 0x73, 0x20, 0x33, 0x20, 0x30,
      0x20, 0x52, 0x3e, 0x3e, 0x65, 0x6e, 0x64, 0x6f, 0x62, 0x6a, 0x0a, 0x65, 0x6f, 0x66, 0x0a
    ]);
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
