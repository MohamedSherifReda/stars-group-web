import React, { useState } from 'react';
import { Link } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi } from '@features/auth/auth.apis';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/common/card';
import { Input } from '@ui/common/input';
import { Button } from '@ui/common/button';
import serveForgetPasswordMeta from '~/meta/serveForgetPasswordMeta';

export const meta = serveForgetPasswordMeta;

export default function ForgotPassword() {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const requestResetMutation = useMutation({
    mutationFn: (identifier: string) => authApi.forgetPassword(identifier),
    onSuccess: () => {
      setStep('reset');
      toast.success('Reset code sent to your email/phone');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send reset code');
    },
  });

  const completeResetMutation = useMutation({
    mutationFn: ({
      identifier,
      password,
    }: {
      identifier: string;
      password: string;
    }) => authApi.completeForgetPassword(identifier, password),
    onSuccess: () => {
      toast.success('Password reset successfully');
      setStep('request');
      setIdentifier('');
      setPassword('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    },
  });

  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      toast.error('Please enter your email or phone number');
      return;
    }
    requestResetMutation.mutate(identifier);
  };

  const handleCompleteReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error('Please enter your new password');
      return;
    }
    completeResetMutation.mutate({ identifier, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {step === 'request' ? 'Forgot Password' : 'Reset Password'}
          </CardTitle>
          <CardDescription className="text-center">
            {step === 'request'
              ? 'Enter your email or phone number to receive a reset code'
              : 'Enter your new password'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'request' ? (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="identifier" className="text-sm font-medium">
                  Email or Phone Number
                </label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="Enter email or phone number"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={requestResetMutation.isPending}
              >
                {requestResetMutation.isPending
                  ? 'Sending...'
                  : 'Send Reset Code'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleCompleteReset} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  New Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={completeResetMutation.isPending}
              >
                {completeResetMutation.isPending
                  ? 'Resetting...'
                  : 'Reset Password'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep('request')}
              >
                Back
              </Button>
            </form>
          )}
          <div className="mt-4 text-center">
            <Link
              to="/auth/login"
              className="text-sm text-blue-600 hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
