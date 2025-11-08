import { useAuthStore } from 'infrastructure/store/auth';
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import { Sidebar } from './Sidebar';

const protectedRoutes = ['/dashboard', '/users', '/brands', '/banners', '/notifications'];

export const isProtectedRoute = (path: string) => {
  return protectedRoutes.includes(path);
};

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoutes: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, initializeAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
    setLoading(false);
  }, []);

  const currentRoute = useLocation().pathname;

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

  return children;
};

export default ProtectedRoutes;
