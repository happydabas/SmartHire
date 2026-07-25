export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  JOBS: {
    BASE: '/jobs',
  },
  PROFILE: {
    BASE: '/profile',
    RESUME: '/profile/resume',
    EDUCATION: '/profile/education',
    EXPERIENCE: '/profile/experience',
    SKILLS: '/profile/skills',
  },
  COMPANY: {
    BASE: '/companies',
  },
  APPLICATIONS: {
    BASE: '/applications',
    HISTORY: '/applications/history',
  },
  SAVED_JOBS: {
    BASE: '/saved-jobs',
  },
  RECRUITER: {
    APPLICATIONS: '/recruiter/jobs',
  },
  MY: {
    JOBS: '/my/jobs',
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    READ_ALL: '/notifications/read-all',
    UNREAD_COUNT: '/notifications/unread-count',
  },
  EMAILS: {
    SEND: '/emails/send',
  },
};
