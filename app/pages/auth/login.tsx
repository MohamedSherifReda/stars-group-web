import React, { useState } from 'react';
import { Navigate, Link } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@utils/queryClient';
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
      const { access_token } = response.data.data;
      try {
        // The signin response set the httpOnly auth cookie, which this request sends.
        // The role comes from the server, never from the token or storage.
        const userResponse = await api.get<User>(
          '/users/profile?relations[profile_image]=true',
          { suppressError: true } as any
        );
        if (userResponse.data?.role !== 'admin') {
          await api
            .post('/auth/signout', undefined, { suppressError: true } as any)
            .catch(() => {});
          toast.error('Invalid credentials');
          return;
        }
        // Nothing from a previous session may be shown to this user
        queryClient.clear();
        setAuth(userResponse.data, access_token);
        toast.success('Login successful');
      } catch {
        toast.error('Login failed');
      }
    },
    onError: (error: any) => {
      // Generic messages only: never echo server wording that reveals whether an account exists
      const status = error?.response?.status;
      if (status === 429) toast.error('Too many attempts, please try again later');
      else if (status && status < 500) toast.error('Invalid credentials');
      else toast.error('Login failed, please try again');
    },
    onSettled: () => {
      // Drop the password and access token from the mutation cache
      queryClient.getMutationCache().clear();
      setFormData((prev) => ({ ...prev, password: '' }));
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
