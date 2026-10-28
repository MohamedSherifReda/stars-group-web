import api from '@utils/api';
import type { AuthResponse } from 'core/types/user.types';

export const authApi = {
  login: (identifier: string, password: string) =>
    api.post<AuthResponse>('/auth/signin', { identifier, password }),

  forgetPassword: (identifier: string) =>
    api.post('/auth/forget-password', { identifier }),

  verifyOTP_Identifier: (identifier: string, otp: string) => {
    return api.post('/auth/verify-otp', { identifier, otp });
  },

  // reset_token is returned by verify-otp (FORGET_PASSWORD) and proves the OTP was verified
  completeForgetPassword: (
    identifier: string,
    password: string,
    reset_token: string
  ) =>
    api.post('/auth/complete-forget-password', {
      identifier,
      password,
      reset_token,
    }),

  getSessionData: (sessionId: string) =>
    api.get(`/auth/get-session-data/${sessionId}`),
};
