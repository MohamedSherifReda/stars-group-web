import type { User } from 'core/types/user.types';
import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import api from '@utils/api';

/**
 * The access token itself lives in an httpOnly cookie set by the API (see the backend's
 * cms-auth-cookie.ts), so scripts on the page cannot read it. Only non-secret session
 * details (user, role, expiry) are kept in localStorage to drive the UI.
 */
const SESSION_KEY = 'auth_session';
const LEGACY_KEYS = ['auth_token', 'user'];

interface StoredSession {
  user: User;
  role: string | null;
  exp: number | null;
}

function readSession(): StoredSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  initializeAuth: () => void;
  checkTokenValidity: () => boolean;
  getUserRole: () => string | null;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user: User, token: string) => {
    let role: string | null = null;
    let exp: number | null = null;
    try {
      const decoded = jwtDecode<{ role?: string; exp?: number }>(token);
      role = decoded?.role ?? null;
      exp = decoded?.exp ?? null;
    } catch (error) {
      console.error('Failed to decode auth token:', error);
    }
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
    localStorage.setItem(SESSION_KEY, JSON.stringify({ user, role, exp }));
    set({ user, token: null, isAuthenticated: true });
  },

  logout: () => {
    // Best effort: clears the httpOnly cookie and revokes the refresh token on the server
    if (readSession()) {
      api.post('/auth/signout', undefined, { suppressError: true } as any).catch(() => {});
    }
    localStorage.removeItem(SESSION_KEY);
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
    set({ user: null, token: null, isAuthenticated: false });
  },

  initializeAuth: () => {
    // Drop tokens stored by older versions of the CMS
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
    const session = readSession();
    if (session?.user) {
      set({ user: session.user, token: null, isAuthenticated: true });
    }
  },

  checkTokenValidity: () => {
    const session = readSession();
    if (!session) return false;
    return !session.exp || session.exp > Date.now() / 1000;
  },

  getUserRole: () => readSession()?.role ?? null,
}));
