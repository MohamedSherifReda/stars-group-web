import type { AxiosInstance, AxiosResponse } from 'axios';
import axios from 'axios';

const isServer = typeof window === 'undefined';

/**
 * Creates a configured Axios instance with interceptors
 */
const createApi = (): AxiosInstance => {
  // Use proxy in development to avoid CORS issues
  const baseURL = import.meta.env.DEV ? '/api' : import.meta.env.VITE_BASE_URL;

  const instance = axios.create({
    baseURL,
    timeout: 10000, // 10 second timeout
    headers: {
      'Content-Type': 'application/json',
      // Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
    },
  });

  instance.interceptors.request.use((config) => {
    if (isServer) return config;
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Request interceptor
  instance.interceptors.request.use((config) => {
    // Server-side requests skip client-side modifications
    if (isServer) return config;

    return config;
  });

  // Response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
      // Handle errors globally unless suppressed
      if (!error.config?.suppressError) {
        handleApiError(error);
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

/**
 * Handles API errors globally
 */
const handleApiError = (error: unknown) => {
  // Implement your error handling logic here
  // Could integrate with your error toast system
  console.error('API Error:', error);
};

const api = createApi();

export default api;
