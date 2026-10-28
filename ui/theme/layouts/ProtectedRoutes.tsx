import { useAuthStore } from 'infrastructure/store/auth';
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router';
import { Sidebar } from './Sidebar';
import PrivacyPolicy from '~/pages/privacy-policy';
import TermsAndConditions from '~/pages/terms-conditions';


const protectedRoutes = [
  '/dashboard',
  '/users',
  '/brands',
  '/banners',
  '/notifications',
  '/contact-us',
  '/settings',
  '/onboarding-images',
];

export const isProtectedRoute = (path: string) => {
  return protectedRoutes.includes(path);
};

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const SESSION_RECHECK_MS = 30_000;

const ProtectedRoutes: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, role, status, initializeAuth, checkTokenValidity, clearSession, logout } =
    useAuthStore();
  const currentRoute = useLocation().pathname;

  // Ask the server who we are (user + role) on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Re-check session expiry after mount: periodically, on tab focus and on route change
  useEffect(() => {
    if (!user) return;
    const check = () => {
      if (!checkTokenValidity()) clearSession(true);
    };
    check();
    const timer = window.setInterval(check, SESSION_RECHECK_MS);
    document.addEventListener('visibilitychange', check);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', check);
    };
  }, [user, currentRoute]);

  if (status !== 'ready') {
    return (
      <main className="flex h-screen items-center justify-center bg-gray-50">
        Loading...
      </main>
    );
  }

  if (user && isProtectedRoute(currentRoute)) {
    // The CMS is admin-only; the API enforces this too. Never render admin UI for other roles.
    if (role !== 'admin') {
      return (
        <main className="flex h-screen flex-col items-center justify-center gap-4 bg-gray-50">
          <p>You are not authorized to use the CMS.</p>
          <button className="underline" onClick={logout}>
            Sign out
          </button>
        </main>
      );
    }
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="ml-64">
          <main className="p-8">{children}</main>
        </div>
      </div>
    );
  }
  if (currentRoute === '/privacy-policy') {
    return <PrivacyPolicy />;
  }

  if (currentRoute === '/terms-and-conditions') {
    return <TermsAndConditions />;
  }
  if (!user && isProtectedRoute(currentRoute)) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

export default ProtectedRoutes;
