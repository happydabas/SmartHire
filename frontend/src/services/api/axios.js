import axios from 'axios';
import { setupInterceptors } from './interceptors';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true,
});

// Configure request/response hook bindings
setupInterceptors(api);

// In-memory client-side response cache for instant page transitions (15s TTL)
const apiCache = new Map();
const CACHE_TTL_MS = 15000;

api.interceptors.request.use((config) => {
  if (config.method === 'get' && !config.params?.nocache && config.responseType !== 'blob') {
    const cacheKey = `${config.url}?${JSON.stringify(config.params || {})}`;
    const cached = apiCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      config.adapter = () => Promise.resolve({
        data: cached.data,
        status: 200,
        statusText: 'OK',
        headers: cached.headers,
        config,
        request: {}
      });
    }
  } else if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
    // Invalidate client cache on data mutations
    apiCache.clear();
  }
  return config;
});

api.interceptors.response.use((response) => {
  // Only cache JSON GET requests, not binary blobs
  if (response.config.method === 'get' && response.status === 200 && response.config.responseType !== 'blob') {
    const cacheKey = `${response.config.url}?${JSON.stringify(response.config.params || {})}`;
    apiCache.set(cacheKey, {
      data: response.data,
      headers: response.headers,
      timestamp: Date.now()
    });
  }
  return response;
});

export default api;
