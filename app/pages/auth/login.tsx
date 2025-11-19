import React, { useState } from 'react';
import { Navigate, Link } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi } from '@features/auth/auth.apis';
import { useAuthStore } from 'infrastructure/store/auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/common/card';
import { Input } from '@ui/common/input';
import { Button } from '@ui/common/button';
import serveLoginMeta from '~/meta/serveLoginMeta';
import type { AuthResponse, User } from 'core/types/user.types';
import api from '@utils/api';

export const meta = serveLoginMeta;

export default function Login() {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });

  const { isAuthenticated, setAuth } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: ({
      identifier,
      password,
    }: {
      identifier: string;
      password: string;
    }) => authApi.login(identifier, password),
    onSuccess: async (response) => {
      const { access_token, desquare_token, complete_phone_number_required } =
        response.data.data;
      const userResponse = await api.get<User>(
        '/users/profile?relations[profile_image]=true',
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      setAuth(userResponse.data, access_token);
      toast.success('Login successful');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.identifier || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    loginMutation.mutate(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="identifier" className="text-sm font-medium">
                Identifier
              </label>
              <Input
                id="identifier"
                name="identifier"
                type="text"
                placeholder="admin@example.com"
                value={formData.identifier}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Signing in...' : 'Login'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link
              to="/auth/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
