import { useAuthStore } from 'infrastructure/store/auth';
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
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
];

export const isProtectedRoute = (path: string) => {
  return protectedRoutes.includes(path);
};

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoutes: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, initializeAuth, token, checkTokenValidity, logout } =
    useAuthStore();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    initializeAuth();
    setLoading(false);
  }, []);

  const currentRoute = useLocation().pathname;

  // if token is expired or does not exist, log the user out and redirect to login page
  useEffect(() => {
    const isTokenValid = checkTokenValidity();
    if (!isTokenValid) {
      logout();
      navigate('/auth/login');
    }
  }, []);

  if (loading) {
    return (
      <main className="flex h-screen items-center justify-center bg-gray-50">
        Loading...
      </main>
    );
  }

  if (user && isProtectedRoute(currentRoute)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="ml-64">
          <main className="p-8">{children}</main>
        </div>
      </div>
    );
  }

  if (!user && isProtectedRoute(currentRoute)) {
    return <Navigate to="/auth/login" replace />;
  }

  if (currentRoute === '/privacy-policy') {
    return <PrivacyPolicy />;
  }

  if (currentRoute === '/terms-and-conditions') {
    return <TermsAndConditions />;
  }

  return children;
};

export default ProtectedRoutes;
