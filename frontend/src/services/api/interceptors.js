import axios from 'axios';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { storage } from '@/utils/storage';

// Keep track of token refreshing state and failed requests queue
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const setupInterceptors = (axiosInstance) => {
  // Request Interceptor
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      const urlStr = originalRequest?.url || '';
      const isAuthRequest = urlStr.includes('login') || urlStr.includes('register') || urlStr.includes('refresh') || urlStr.includes('auth');

      // Handle 401 Unauthorized errors and prevent infinite recursion loops
      if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
        if (isRefreshing) {
          // Queue requests if token refresh is already in progress
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axiosInstance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
          if (!refreshToken) throw new Error('No refresh token available');

          // Send token refresh request bypassing the custom instance's automatic auth header attachments
          const response = await axios.post(`${axiosInstance.defaults.baseURL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token } = response.data;
          
          // Update tokens in local storage
          storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);

          // Notify the AuthProvider context wrapper (if active) to synchronize state variables
          if (window.__auth_token_update_listener__) {
            window.__auth_token_update_listener__(access_token);
          }

          processQueue(null, access_token);
          isRefreshing = false;

          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;

          // Clear credentials storage
          storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          storage.removeItem(STORAGE_KEYS.USER);

          // Trigger context redirection or default redirection
          if (window.__auth_refresh_failed_listener__) {
            window.__auth_refresh_failed_listener__();
          } else {
            window.location.href = '/login?error=session_expired';
          }
          
          return Promise.reject(refreshError);
        }
      }

      // Handle standard API errors
      if (error.response) {
        const { status } = error.response;
        const urlStr = error.config?.url || '';
        const isAuthRequest = urlStr.includes('login') || urlStr.includes('register') || urlStr.includes('refresh') || urlStr.includes('auth');

        switch (status) {
          case 400:
            console.error('Bad Request (400):', error.response.data);
            break;
          case 401:
            // Force logout and redirect if login endpoint itself returns 401
            if (isAuthRequest) {
              storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
              storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
              storage.removeItem(STORAGE_KEYS.USER);
              if (window.__auth_refresh_failed_listener__) {
                window.__auth_refresh_failed_listener__();
              } else {
                window.location.href = '/login?error=session_expired';
              }
            }
            break;
          case 403:
            console.error('Forbidden (403): Access is restricted.');
            window.location.href = '/unauthorized';
            break;
          case 404:
            console.error('Not Found (404): Resource not found.');
            // Skip redirecting if checking metadata / profiles that safely handle 404
            if (!urlStr.includes('resume') && !urlStr.includes('profile') && !urlStr.includes('notifications') && !isAuthRequest) {
              window.location.href = '/404';
            }
            break;
          case 500:
            console.error('Internal Server Error (500): Technical issue on server.');
            window.location.href = '/500';
            break;
        }
      } else {
        // Log unexpected errors securely without displaying details
        console.error('Unexpected connection error:', error.message || error);
      }
      return Promise.reject(error);
    }
  );
};
