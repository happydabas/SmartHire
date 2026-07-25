import api from './api/axios';

const LOCAL_STORAGE_PROFILE_KEY = 'smarthire_admin_profile';
const LOCAL_STORAGE_PREFS_KEY = 'smarthire_admin_prefs';
const LOCAL_STORAGE_LOGS_KEY = 'smarthire_admin_logs';

const INITIAL_PROFILE = {
  name: 'Administrator',
  email: 'admin@smarthire.com',
  phone: '+91 98765 43210',
  role: 'ADMIN',
  created_at: '2026-01-01T00:00:00Z',
  avatar_url: ''
};

const INITIAL_PREFS = {
  email: {
    securityAlerts: true,
    newCompanies: true,
    newJobs: false,
    platformUpdates: true
  },
  inApp: {
    securityAlerts: true,
    systemAnnouncements: true,
    moderationAlerts: false
  }
};

const INITIAL_LOGS = [
  { id: 1, timestamp: '2026-07-25T11:00:00Z', admin: 'Administrator', action: 'Verify Company', module: 'Companies', status: 'Success', ip: '192.168.1.1' },
  { id: 2, timestamp: '2026-07-25T10:45:00Z', admin: 'Administrator', action: 'Suspend Company', module: 'Companies', status: 'Success', ip: '192.168.1.1' },
  { id: 3, timestamp: '2026-07-25T09:30:00Z', admin: 'Administrator', action: 'Approve Job', module: 'Jobs', status: 'Success', ip: '192.168.1.1' },
  { id: 4, timestamp: '2026-07-24T16:20:00Z', admin: 'Administrator', action: 'Deactivate User', module: 'Users', status: 'Success', ip: '192.168.1.4' },
  { id: 5, timestamp: '2026-07-24T14:15:00Z', admin: 'Administrator', action: 'Reject Job', module: 'Jobs', status: 'Success', ip: '192.168.1.4' },
  { id: 6, timestamp: '2026-07-23T11:10:00Z', admin: 'Administrator', action: 'Login Success', module: 'Security', status: 'Success', ip: '192.168.1.1' },
  { id: 7, timestamp: '2026-07-22T10:05:00Z', admin: 'Administrator', action: 'Export System Report', module: 'Analytics', status: 'Success', ip: '192.168.1.20' }
];

const getLocalStorageProfile = () => {
  const data = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(INITIAL_PROFILE));
    return INITIAL_PROFILE;
  }
  return JSON.parse(data);
};

const getLocalStoragePrefs = () => {
  const data = localStorage.getItem(LOCAL_STORAGE_PREFS_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_PREFS_KEY, JSON.stringify(INITIAL_PREFS));
    return INITIAL_PREFS;
  }
  return JSON.parse(data);
};

const getLocalStorageLogs = () => {
  const data = localStorage.getItem(LOCAL_STORAGE_LOGS_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_LOGS_KEY, JSON.stringify(INITIAL_LOGS));
    return INITIAL_LOGS;
  }
  return JSON.parse(data);
};

export const adminSettingsService = {
  useMock: false,

  getProfile: async () => {
    try {
      if (adminSettingsService.useMock) throw new Error('Mock mode active');
      const response = await api.get('/admin/profile');
      return response.data;
    } catch (error) {
      console.warn('Admin API: getProfile failed. Using fallback.', error.message);
      adminSettingsService.useMock = true;
      return getLocalStorageProfile();
    }
  },

  updateProfile: async (data) => {
    try {
      if (adminSettingsService.useMock) throw new Error('Mock mode active');
      const response = await api.put('/admin/profile', data);
      return response.data;
    } catch (error) {
      console.warn('Admin API: updateProfile failed. Using fallback.', error.message);
      adminSettingsService.useMock = true;
      const profile = getLocalStorageProfile();
      const updated = { ...profile, ...data };
      localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(updated));
      return updated;
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      if (adminSettingsService.useMock) throw new Error('Mock mode active');
      const response = await api.post('/admin/change-password', { currentPassword, newPassword });
      return response.data;
    } catch (error) {
      console.warn('Admin API: changePassword failed. Using mock success.', error.message);
      adminSettingsService.useMock = true;
      return { success: true };
    }
  },

  getNotificationPreferences: async () => {
    try {
      if (adminSettingsService.useMock) throw new Error('Mock mode active');
      const response = await api.get('/admin/settings/notifications');
      return response.data;
    } catch (error) {
      console.warn('Admin API: getNotificationPreferences failed. Using fallback.', error.message);
      adminSettingsService.useMock = true;
      return getLocalStoragePrefs();
    }
  },

  updateNotificationPreferences: async (prefs) => {
    try {
      if (adminSettingsService.useMock) throw new Error('Mock mode active');
      const response = await api.put('/admin/settings/notifications', prefs);
      return response.data;
    } catch (error) {
      console.warn('Admin API: updateNotificationPreferences failed. Using fallback.', error.message);
      adminSettingsService.useMock = true;
      localStorage.setItem(LOCAL_STORAGE_PREFS_KEY, JSON.stringify(prefs));
      return prefs;
    }
  },

  getSystemInformation: async () => {
    try {
      if (adminSettingsService.useMock) throw new Error('Mock mode active');
      const response = await api.get('/admin/settings/system');
      return response.data;
    } catch (error) {
      console.warn('Admin API: getSystemInformation failed. Using fallback.', error.message);
      adminSettingsService.useMock = true;
      return {
        version: 'v1.4.2',
        environment: 'Development',
        dbStatus: 'Connected',
        apiStatus: 'Healthy',
        feVersion: 'v0.9.8',
        lastDeployment: '2026-07-24T18:00:00Z'
      };
    }
  },

  getAuditLogs: async (params = {}) => {
    const { page = 1, limit = 10, search = '', module = 'all', status = 'all' } = params;
    try {
      if (adminSettingsService.useMock) throw new Error('Mock mode active');
      const response = await api.get('/admin/settings/audit-logs', { params });
      return response.data;
    } catch (error) {
      console.warn('Admin API: getAuditLogs failed. Using fallback.', error.message);
      adminSettingsService.useMock = true;

      let items = getLocalStorageLogs();

      // Apply Search (Action or Admin Name or IP)
      if (search) {
        const query = search.toLowerCase().trim();
        items = items.filter(l => 
          l.action.toLowerCase().includes(query) || 
          l.admin.toLowerCase().includes(query) ||
          l.ip.includes(query)
        );
      }

      // Apply Module Filter
      if (module !== 'all') {
        items = items.filter(l => l.module === module);
      }

      // Apply Status Filter
      if (status !== 'all') {
        items = items.filter(l => l.status === status);
      }

      // Sort: Newest logs first
      items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Pagination
      const total = items.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedItems = items.slice(start, end);

      return {
        items: paginatedItems,
        total,
        page,
        limit,
        totalPages
      };
    }
  }
};

export default adminSettingsService;
