import type { AxiosInstance, AxiosResponse } from 'axios';
import axios from 'axios';

const isServer = typeof window === 'undefined';

/**
 * Creates a configured Axios instance with interceptors
 */
const createApi = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    timeout: 10000, // 10 second timeout
    headers: {
      'Content-Type': 'application/json',
    },
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
