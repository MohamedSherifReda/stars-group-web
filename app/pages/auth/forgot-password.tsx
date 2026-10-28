import React, { useState } from 'react';
import { Link } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@utils/queryClient';
import { useAuthStore } from 'infrastructure/store/auth';
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
import api from '@utils/api';
import serveForgetPasswordMeta from '~/meta/serveForgetPasswordMeta';

export const meta = serveForgetPasswordMeta;

export default function ForgotPassword() {
  const [step, setStep] = useState<'request' | 'verify_otp' | 'reset'>(
    'request'
  );
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOTP] = useState('');
  // Held in component state only (never storage); cleared on success and on going back
  const [resetToken, setResetToken] = useState('');
  const requestResetMutation = useMutation({
    mutationFn: (identifier: string) => authApi.forgetPassword(identifier),
    onSuccess: () => {
      setStep('verify_otp');
      // Same message whether or not the account exists
      toast.success('If the account exists, a reset code has been sent');
    },
    onError: (error: any) => {
      // Do not reveal whether the identifier exists: behave the same except for throttling
      if (error?.response?.status === 429) {
        toast.error('Too many attempts, please try again later');
      } else if (!error?.response || error.response.status >= 500) {
        toast.error('Something went wrong, please try again');
      } else {
        setStep('verify_otp');
        toast.success('If the account exists, a reset code has been sent');
      }
    },
    onSettled: () => queryClient.getMutationCache().clear(),
  });

  const verifyOTP_IdentifierMutation = useMutation({
    mutationFn: ({ identifier, otp }: { identifier: string; otp: string }) => {
      return authApi.verifyOTP_Identifier(identifier, otp);
    },
    onSuccess: (response) => {
      const token: string | undefined =
        response.data?.data?.reset_token ?? response.data?.reset_token;
      if (!token) {
        toast.error('Failed to verify OTP');
        return;
      }
      setResetToken(token);
      setOTP('');
      toast.success('OTP verified successfully');
      setStep('reset');
    },
    onError: () => {
      toast.error('Invalid or expired code');
    },
    onSettled: () => queryClient.getMutationCache().clear(),
  });

  const completeResetMutation = useMutation({
    mutationFn: async ({
      identifier,
      password,
      resetToken,
    }: {
      identifier: string;
      password: string;
      resetToken: string;
    }) => {
      // Drop any existing session and cached data before the reset
      const auth = useAuthStore.getState();
      if (auth.isAuthenticated) {
        await api
          .post('/auth/signout', undefined, { suppressError: true } as any)
          .catch(() => {});
      }
      auth.clearSession(true);
      return authApi.completeForgetPassword(identifier, password, resetToken);
    },
    onSuccess: () => {
      toast.success('Password reset successfully, please log in');
      setStep('request');
      setIdentifier('');
      setPassword('');
      setResetToken('');
      // Full navigation to a fresh login page (no in-memory state carried over)
      window.location.assign('/auth/login');
    },
    onError: () => {
      toast.error('Failed to reset password. The code may have expired.');
    },
    onSettled: () => queryClient.getMutationCache().clear(),
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
    completeResetMutation.mutate({ identifier, password, resetToken });
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast.error('Please enter your OTP');
      return;
    }
    verifyOTP_IdentifierMutation.mutate({ identifier, otp });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {step === 'request'
              ? 'Forgot Password'
              : step === 'verify_otp'
              ? 'Verify OTP'
              : 'Reset Password'}
          </CardTitle>
          <CardDescription className="text-center">
            {step === 'request'
              ? 'Enter your email or phone number to receive a reset code'
              : step === 'verify_otp'
              ? 'Enter the OTP sent to your email or phone number'
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
          ) : step === 'verify_otp' ? (
            <>
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="otp" className="text-sm font-medium">
                    OTP
                  </label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOTP(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={verifyOTP_IdentifierMutation.isPending}
                >
                  {verifyOTP_IdentifierMutation.isPending
                    ? 'Verifying...'
                    : 'Verify OTP'}
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
            </>
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
                onClick={() => {
                  setResetToken('');
                  setPassword('');
                  setStep('request');
                }}
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
