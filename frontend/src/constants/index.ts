export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'smarthire_access_token',
  REFRESH_TOKEN: 'smarthire_refresh_token',
  USER_PROFILE: 'smarthire_user_profile',
} as const;

export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  JOBS: '/jobs',
  RESUME: '/resume',
  DASHBOARD: '/dashboard',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
} as const;
