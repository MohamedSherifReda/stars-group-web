import type { User } from 'core/types/user.types';
import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import api, { setUnauthorizedHandler } from '@utils/api';
import { queryClient } from '@utils/queryClient';

/**
 * The access token lives in an httpOnly cookie set by the API (see the backend's
 * cms-auth-cookie.ts); scripts on the page can never read it and this store never keeps it.
 *
 * localStorage only holds a non-secret "a session probably exists" hint ({ exp }) so the
 * app knows whether to ask the server who the user is. It is NOT proof of being logged in:
 * the user and role always come from the server (`GET /users/profile`), and the
 * `x-cms-client` request header is only the API's CSRF defence, never an auth signal.
 */
const SESSION_KEY = 'auth_session';
// Keys written by older versions of the CMS (tokens / full user objects / role cache)
const LEGACY_KEYS = ['auth_token', 'user', 'auth-storage'];
const CHANNEL_NAME = 'sg-cms-auth';

interface SessionHint {
  exp: number | null;
}

function readHint(): SessionHint | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { exp: typeof parsed?.exp === 'number' ? parsed.exp : null };
  } catch {
    return null;
  }
}

function clearStorage() {
  try {
    localStorage.removeItem(SESSION_KEY);
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch {
    /* storage unavailable */
  }
}

let channel: BroadcastChannel | null = null;
function getChannel() {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return null;
  if (!channel) channel = new BroadcastChannel(CHANNEL_NAME);
  return channel;
}

type AuthStatus = 'idle' | 'checking' | 'ready';

interface AuthState {
  user: User | null;
  /** Role as reported by the server for the current session (never read from storage). */
  role: string | null;
  isAuthenticated: boolean;
  status: AuthStatus;
  /** Records a successful login. The token is only decoded for its expiry and is not retained. */
  setAuth: (user: User, token?: string) => void;
  logout: () => void;
  /** Local-only teardown (no API call), used for 401s and cross-tab logout. */
  clearSession: (broadcast?: boolean) => void;
  initializeAuth: () => Promise<void>;
  checkTokenValidity: () => boolean;
  getUserRole: () => string | null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  role: null,
  isAuthenticated: false,
  status: 'idle',

  setAuth: (user, token) => {
    let exp: number | null = null;
    if (token) {
      try {
        exp = jwtDecode<{ exp?: number }>(token)?.exp ?? null;
      } catch {
        exp = null;
      }
    }
    clearStorage();
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ exp }));
    } catch {
      /* storage unavailable */
    }
    set({ user, role: user?.role ?? null, isAuthenticated: true, status: 'ready' });
  },

  clearSession: (broadcast = false) => {
    clearStorage();
    // Nothing fetched for the previous user may leak to the next one
    queryClient.clear();
    set({ user: null, role: null, isAuthenticated: false, status: 'ready' });
    if (broadcast) getChannel()?.postMessage({ type: 'logout' });
  },

  logout: () => {
    // Best effort: clears the httpOnly cookie and revokes the refresh token on the server
    if (get().isAuthenticated || readHint()) {
      api.post('/auth/signout', undefined, { suppressError: true } as any).catch(() => {});
    }
    get().clearSession(true);
  },

  initializeAuth: async () => {
    LEGACY_KEYS.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        /* storage unavailable */
      }
    });
    const hint = readHint();
    if (!hint || (hint.exp && hint.exp <= Date.now() / 1000)) {
      if (hint) clearStorage();
      set({ status: 'ready' });
      return;
    }
    set({ status: 'checking' });
    try {
      const res = await api.get<User>('/users/profile?relations[profile_image]=true', {
        suppressError: true,
      } as any);
      set({
        user: res.data,
        role: res.data?.role ?? null,
        isAuthenticated: true,
        status: 'ready',
      });
    } catch (error: any) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        get().clearSession();
      } else {
        // Server unreachable: stay logged out in the UI but keep the hint for a retry
        set({ status: 'ready' });
      }
    }
  },

  checkTokenValidity: () => {
    const hint = readHint();
    if (!hint) return false;
    return !hint.exp || hint.exp > Date.now() / 1000;
  },

  getUserRole: () => get().role,
}));

/** True only when the server said this session belongs to an admin. */
export const useIsAdmin = () => useAuthStore((s) => s.isAuthenticated && s.role === 'admin');

if (typeof window !== 'undefined') {
  // Any 401 from the API means the session is gone: drop all local state
  setUnauthorizedHandler(() => {
    if (useAuthStore.getState().isAuthenticated || readHint()) {
      useAuthStore.getState().clearSession(true);
    }
  });

  // Cross-tab logout
  getChannel()?.addEventListener('message', (event) => {
    if (event.data?.type === 'logout') useAuthStore.getState().clearSession(false);
  });
  window.addEventListener('storage', (event) => {
    if (event.key === SESSION_KEY && event.newValue === null) {
      useAuthStore.getState().clearSession(false);
    }
  });
}
