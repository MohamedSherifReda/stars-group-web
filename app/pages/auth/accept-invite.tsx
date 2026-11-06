import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi } from '@features/auth/auth.apis';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/common/card';
import { Input } from '@ui/common/input';
import { Button } from '@ui/common/button';
import { PASSWORD_HINT, apiErrorMessage, passwordSchema } from '@utils/password';

export const meta = () => [{ title: 'Stars Group CMS - Accept Invitation' }];

const schema = z
  .object({
    name: z.string().trim().max(100, 'Name is too long').optional(),
    password: passwordSchema,
    confirm: z.string().min(1, 'Confirm your password'),
  })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Passwords do not match' });
type FormValues = z.infer<typeof schema>;

export default function AcceptInvite() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') ?? '';
  const [done, setDone] = useState(false);

  const invitation = useQuery({
    queryKey: ['accept-invite', token],
    queryFn: () => authApi.getInvitation(token).then((r) => r.data.data),
    enabled: !!token,
    retry: false,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: '', password: '', confirm: '' } });

  useEffect(() => {
    if (invitation.data?.name) setValue('name', invitation.data.name);
  }, [invitation.data, setValue]);

  const accept = useMutation({
    mutationFn: (v: FormValues) =>
      authApi.acceptInvitation({ token, password: v.password, ...(v.name ? { name: v.name } : {}) }),
    onSuccess: () => {
      setDone(true);
      toast.success('Account created, please log in');
      navigate('/auth/login', { replace: true });
    },
    onError: (e: any) => toast.error(apiErrorMessage(e, 'Failed to accept the invitation')),
  });

  const invalid = !token || invitation.isError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Accept invitation</CardTitle>
          <CardDescription className="text-center">
            {invalid ? '' : 'Choose a password to finish creating your CMS account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invalid ? (
            <div className="space-y-4 text-center">
              <p className="text-red-600">This invitation link is invalid or has expired.</p>
              <p className="text-sm text-gray-600">Ask an administrator to send you a new invitation.</p>
              <Link to="/auth/login" className="text-sm text-blue-600 hover:underline">
                Back to Login
              </Link>
            </div>
          ) : invitation.isLoading ? (
            <div className="py-6 text-center text-gray-500">Checking invitation...</div>
          ) : (
            <form onSubmit={handleSubmit((v) => accept.mutate(v))} className="space-y-4" noValidate>
              <div className="space-y-2">
                <label htmlFor="ai-email" className="text-sm font-medium">
                  Email
                </label>
                <Input id="ai-email" value={invitation.data?.email ?? ''} readOnly disabled />
              </div>
              <div className="space-y-2">
                <label htmlFor="ai-name" className="text-sm font-medium">
                  Name
                </label>
                <Input id="ai-name" autoComplete="name" {...register('name')} />
                {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="ai-password" className="text-sm font-medium">
                  Password
                </label>
                <Input id="ai-password" type="password" autoComplete="new-password" {...register('password')} />
                <p className="text-xs text-gray-500">{PASSWORD_HINT}</p>
                {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="ai-confirm" className="text-sm font-medium">
                  Confirm password
                </label>
                <Input id="ai-confirm" type="password" autoComplete="new-password" {...register('confirm')} />
                {errors.confirm && <p className="text-sm text-red-600">{errors.confirm.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={accept.isPending || done}>
                {accept.isPending ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
