import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/common/card';
import { Input } from '@ui/common/input';
import { Button } from '@ui/common/button';
import { authApi } from '@features/auth/auth.apis';
import { useAuthStore } from 'infrastructure/store/auth';
import { PASSWORD_HINT, apiErrorMessage, passwordSchema } from '@utils/password';

const schema = z
  .object({
    current_password: z.string().min(1, 'Enter your current password'),
    new_password: passwordSchema,
    confirm: z.string().min(1, 'Confirm the new password'),
  })
  .refine((v) => v.new_password === v.confirm, { path: ['confirm'], message: 'Passwords do not match' })
  .refine((v) => v.new_password !== v.current_password, {
    path: ['new_password'],
    message: 'The new password must be different from the current one',
  });
type FormValues = z.infer<typeof schema>;

const empty: FormValues = { current_password: '', new_password: '', confirm: '' };

/** "My account": the signed-in user changes their own password and stays signed in. */
export default function ChangePasswordForm() {
  const { user, setAuth } = useAuthStore();
  const {
    register,
    handleSubmit,
    reset,
    resetField,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: empty });

  const mutation = useMutation({
    mutationFn: (v: FormValues) => authApi.changePassword(v.current_password, v.new_password),
    onSuccess: (res) => {
      // The API re-issued the session cookie; refresh the local expiry hint and stay signed in
      if (user) setAuth(user, res.data?.data?.access_token);
      toast.success('Password changed. Other devices were signed out.');
      reset(empty);
    },
    onError: (error: any) => {
      if (error?.response?.status === 403) {
        setError('current_password', { message: 'Your current password is incorrect' });
        resetField('current_password', { keepError: true });
      } else {
        toast.error(apiErrorMessage(error, 'Failed to change password'));
      }
    },
  });

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>
          {user?.email ? `Signed in as ${user.email}. ` : ''}Other devices are signed out when you change it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4" noValidate>
          <div className="space-y-2">
            <label htmlFor="cp-current" className="text-sm font-medium">
              Current password
            </label>
            <Input id="cp-current" type="password" autoComplete="current-password" {...register('current_password')} />
            {errors.current_password && <p className="text-sm text-red-600">{errors.current_password.message}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="cp-new" className="text-sm font-medium">
              New password
            </label>
            <Input id="cp-new" type="password" autoComplete="new-password" {...register('new_password')} />
            <p className="text-xs text-gray-500">{PASSWORD_HINT}</p>
            {errors.new_password && <p className="text-sm text-red-600">{errors.new_password.message}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="cp-confirm" className="text-sm font-medium">
              Confirm new password
            </label>
            <Input id="cp-confirm" type="password" autoComplete="new-password" {...register('confirm')} />
            {errors.confirm && <p className="text-sm text-red-600">{errors.confirm.message}</p>}
          </div>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Change password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
