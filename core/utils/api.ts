import type { AxiosInstance, AxiosResponse } from 'axios';
import axios from 'axios';

const isServer = typeof window === 'undefined';

let unauthorizedHandler: (() => void) | null = null;
/** Registered by the auth store; called on any 401 outside /auth/*. */
export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  unauthorizedHandler = handler;
};

/**
 * Creates a configured Axios instance with interceptors
 */
const createApi = (): AxiosInstance => {
  // Use proxy in development to avoid CORS issues
  // VITE_BASE_URL is required; production builds fail in vite.config.ts when it is unset
  const baseURL = import.meta.env.VITE_BASE_URL;

  const instance = axios.create({
    baseURL,
    timeout: 60000, // 60 second timeout
    // Auth is an httpOnly cookie set by the API; the x-cms-client header tells the API to accept it
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'x-cms-client': '1',
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
      const status = error?.response?.status;
      const url: string = error?.config?.url ?? '';
      // An expired/revoked session: let the auth store wipe local state (not for login attempts)
      if (status === 401 && !url.includes('/auth/')) {
        unauthorizedHandler?.();
      }
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
  // Never log the whole Axios error: config.data holds request bodies (passwords, OTPs, tokens)
  if (import.meta.env.DEV) {
    const e = error as any;
    console.error('API Error:', e?.config?.method, e?.config?.url, e?.response?.status ?? e?.message);
  }
};

const api = createApi();

export default api;
