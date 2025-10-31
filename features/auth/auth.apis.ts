import api from '@utils/api';
import type { AuthResponse } from 'core/types/user.types';

export const authApi = {
  login: (identifier: string, password: string) =>
    api.post<AuthResponse>('/auth/signin', { identifier, password }),

  forgetPassword: (identifier: string) =>
    api.post('/auth/forget-password', { identifier }),

  completeForgetPassword: (identifier: string, password: string) =>
    api.post('/auth/complete-forget-password', { identifier, password }),

  getSessionData: (sessionId: string) =>
    api.get(`/auth/get-session-data/${sessionId}`),
};
