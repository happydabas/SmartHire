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

export default api;
