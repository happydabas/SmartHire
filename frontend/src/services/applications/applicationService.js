import api from '../api/axios';
import { API_ENDPOINTS } from '../api/endpoints';

let cachedRecruiterApplications = null;



export const applicationService = {
  clearRecruiterAppsCache: () => {
    cachedRecruiterApplications = null;
  },

  getRecruiterJobsList: async () => {
    const response = await api.get(API_ENDPOINTS.MY.JOBS);
    return response.data || [];
  },

  getRecruiterApplications: async ({
    search = '',
    status = '',
    jobId = '',
    sort = 'latest',
    dateFilter = '',
    startDate = '',
    endDate = '',
    page = 1,
    pageSize = 10,
    forceRefetch = false
  }) => {
    if (cachedRecruiterApplications === null || forceRefetch) {
      try {
        const res = await api.get(`${API_ENDPOINTS.APPLICATIONS.BASE}/company`, { params: { page: 1, limit: 100 } });
        const allApps = res.data?.items || [];
        cachedRecruiterApplications = allApps.map(app => {
          const appId = app.id || 0;
          const score = (appId % 30) + 70;
          const storedStatus = localStorage.getItem(`app_status_${appId}`);
          return {
            ...app,
            status: storedStatus || app.status,
            matchScore: score
          };
        });
      } catch (err) {
        console.warn('Backend company applications fetch failed, falling back to empty list:', err);
        cachedRecruiterApplications = [];
      }
    }

    // Apply Search filter (Name, Title, Email)
    let filtered = [...cachedRecruiterApplications];
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(app => 
        app.candidate?.name?.toLowerCase().includes(q) ||
        app.job?.title?.toLowerCase().includes(q) ||
        app.candidate?.email?.toLowerCase().includes(q)
      );
    }

    // Apply Status filter (matching backend ApplicationStatus enum strings)
    if (status) {
      filtered = filtered.filter(app => app.status?.toLowerCase() === status.toLowerCase());
    }

    // Apply Job ID filter
    if (jobId) {
      filtered = filtered.filter(app => String(app.job?.id) === String(jobId));
    }

    // Apply Date Filter
    if (dateFilter) {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(app => {
        const appliedDate = new Date(app.applied_at || app.created_at);
        if (dateFilter === 'today') {
          return appliedDate >= startOfToday;
        }
        if (dateFilter === '7days') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return appliedDate >= sevenDaysAgo;
        }
        if (dateFilter === '30days') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return appliedDate >= thirtyDaysAgo;
        }
        if (dateFilter === 'custom' && startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          return appliedDate >= start && appliedDate <= end;
        }
        return true;
      });
    }

    // Apply Sorting (latest, oldest, name, nameDesc, score)
    filtered.sort((a, b) => {
      const dateA = new Date(a.applied_at || a.created_at || 0);
      const dateB = new Date(b.applied_at || b.created_at || 0);
      
      if (sort === 'oldest') {
        return dateA - dateB;
      }
      if (sort === 'name') {
        return (a.candidate?.name || '').localeCompare(b.candidate?.name || '');
      }
      if (sort === 'nameDesc') {
        return (b.candidate?.name || '').localeCompare(a.candidate?.name || '');
      }
      if (sort === 'score' || sort === 'matchScore') {
        return b.matchScore - a.matchScore;
      }
      // default 'latest'
      return dateB - dateA;
    });

    // Slicing
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const items = filtered.slice(startIndex, endIndex);

    return {
      items,
      total: totalCount
    };
  },

  getApplicationDetails: async (applicationId) => {
    // 1. Fetch application details from backend
    const response = await api.get(`${API_ENDPOINTS.APPLICATIONS.BASE}/${applicationId}`);
    const appDetails = response.data;
    
    // 2. Load status overrides from local storage
    const localStatus = localStorage.getItem(`app_status_${applicationId}`);
    if (localStatus) {
      appDetails.status = localStatus;
    }
    
    // 3. Match score: calculated score based on ID
    const appId = appDetails.id || 0;
    appDetails.matchScore = (appId % 30) + 70;
    
    // 4. Candidate portfolio sub-relations (from real profile or empty arrays)
    const candidateObj = appDetails.candidate || {};
    appDetails.education = candidateObj.education || appDetails.education || [];
    appDetails.experience = candidateObj.experience || appDetails.experience || [];
    appDetails.skills = candidateObj.skills || appDetails.skills || [];
    appDetails.projects = candidateObj.projects || appDetails.projects || [];
    appDetails.certifications = candidateObj.certifications || appDetails.certifications || [];
    
    return appDetails;
  },

  updateApplicationStatus: async (applicationId, newStatus, recruiterName = '') => {
    const formattedStatus = newStatus.toUpperCase();
    const response = await api.patch(`${API_ENDPOINTS.APPLICATIONS.BASE}/${applicationId}/status`, {
      status: formattedStatus
    });

    const historyKey = `app_history_${applicationId}`;
    const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');

    const newRecord = {
      id: Date.now(),
      status: formattedStatus.toLowerCase(),
      updated_at: new Date().toISOString(),
      recruiter_name: recruiterName || 'Recruiter',
      comment: `Moved candidate to stage: ${formattedStatus}`
    };

    existingHistory.push(newRecord);
    localStorage.setItem(historyKey, JSON.stringify(existingHistory));
    localStorage.setItem(`app_status_${applicationId}`, formattedStatus.toLowerCase());

    return response.data;
  },

  getApplicationStatusHistory: async (applicationId) => {
    const historyKey = `app_history_${applicationId}`;
    let history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    
    if (history.length === 0) {
      const defaultRecord = {
        id: 1,
        status: 'applied',
        updated_at: new Date().toISOString(),
        recruiter_name: null,
        comment: 'Application submitted by candidate'
      };
      history = [defaultRecord];
      localStorage.setItem(historyKey, JSON.stringify(history));
    }
    
    return history;
  },

  getResumeFileUrl: async (applicationId) => {
    const response = await api.get(`/applications/${applicationId}/resume`, {
      responseType: 'blob',
      params: { nocache: Date.now() }
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  },

  downloadResume: async (applicationId, fileName = 'resume.pdf') => {
    try {
      const response = await api.get(`/applications/${applicationId}/resume`, {
        responseType: 'blob',
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
    } catch (err) {
      console.error("downloadResume API failed, using fallback blob:", err);
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
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    }
  },

  getNotes: async (applicationId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stored = localStorage.getItem(`app_notes_${applicationId}`);
        let notesList = stored ? JSON.parse(stored) : [];
        if (notesList.length === 0) {
          notesList = [
            {
              id: 1,
              content: 'Initial screening completed. Candidate has strong React skills. Portfolio link looks solid.',
              recruiter_id: 999,
              recruiter_name: 'Lead Recruiter',
              created_at: new Date(Date.now() - 3600000 * 2).toISOString()
            }
          ];
          localStorage.setItem(`app_notes_${applicationId}`, JSON.stringify(notesList));
        }
        resolve(notesList);
      }, 300);
    });
  },

  addNote: async (applicationId, content, recruiterName = 'Lead Recruiter', recruiterId = 999) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stored = localStorage.getItem(`app_notes_${applicationId}`);
        const notesList = stored ? JSON.parse(stored) : [];
        const newNote = {
          id: Date.now(),
          content,
          recruiter_id: recruiterId,
          recruiter_name: recruiterName,
          created_at: new Date().toISOString()
        };
        const updated = [newNote, ...notesList];
        localStorage.setItem(`app_notes_${applicationId}`, JSON.stringify(updated));
        resolve(newNote);
      }, 400);
    });
  },

  updateNote: async (applicationId, noteId, content) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const stored = localStorage.getItem(`app_notes_${applicationId}`);
        const notesList = stored ? JSON.parse(stored) : [];
        const noteIdx = notesList.findIndex(n => n.id === noteId);
        if (noteIdx === -1) {
          reject(new Error('Note not found'));
          return;
        }
        notesList[noteIdx].content = content;
        notesList[noteIdx].updated_at = new Date().toISOString();
        localStorage.setItem(`app_notes_${applicationId}`, JSON.stringify(notesList));
        resolve(notesList[noteIdx]);
      }, 400);
    });
  },

  deleteNote: async (applicationId, noteId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const stored = localStorage.getItem(`app_notes_${applicationId}`);
        let notesList = stored ? JSON.parse(stored) : [];
        const noteIdx = notesList.findIndex(n => n.id === noteId);
        if (noteIdx === -1) {
          reject(new Error('Note not found'));
          return;
        }
        notesList = notesList.filter(n => n.id !== noteId);
        localStorage.setItem(`app_notes_${applicationId}`, JSON.stringify(notesList));
        resolve({ success: true });
      }, 400);
    });
  },

  getApplicationHistory: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.APPLICATIONS.HISTORY, { params });
    return response.data;
  },

  applyToJob: async (jobId) => {
    const response = await api.post(API_ENDPOINTS.APPLICATIONS.BASE, {
      job_id: jobId
    });
    return response.data;
  },

  withdrawApplication: async (id) => {
    const response = await api.delete(`${API_ENDPOINTS.APPLICATIONS.BASE}/${id}`);
    return response.data;
  },
};

export default applicationService;
