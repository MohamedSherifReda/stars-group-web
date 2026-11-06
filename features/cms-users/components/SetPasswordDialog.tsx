import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@ui/common/dialog';
import { Button } from '@ui/common/button';
import { Input } from '@ui/common/input';
import { PASSWORD_HINT, apiErrorMessage, passwordSchema } from '@utils/password';
import { cmsUsersApi, type CmsUser } from '../cms-users.apis';

const schema = z
  .object({
    password: passwordSchema,
    confirm: z.string().min(1, 'Confirm the new password'),
    current_password: z.string().min(1, 'Enter your own password'),
  })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Passwords do not match' });
type FormValues = z.infer<typeof schema>;

const empty: FormValues = { password: '', confirm: '', current_password: '' };

export default function SetPasswordDialog({
  user,
  onClose,
}: {
  user: CmsUser | null;
  onClose: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    resetField,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: empty });

  // Never keep typed passwords around once the dialog closes
  useEffect(() => {
    if (!user) reset(empty);
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: (v: FormValues) =>
      cmsUsersApi.setPassword(user!.id, { password: v.password, current_password: v.current_password }),
    onSuccess: () => {
      toast.success('Password updated. The user was signed out everywhere.');
      onClose();
    },
    onError: (error: any) => {
      if (error?.response?.status === 403) {
        setError('current_password', { message: 'Your password is incorrect' });
      } else {
        toast.error(apiErrorMessage(error, 'Failed to update password'));
      }
    },
    onSettled: () => resetField('current_password', { keepError: true }),
  });

  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set password</DialogTitle>
          <DialogDescription>
            Set a new password for {user?.name || user?.email}. They will be signed out of all devices.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4" noValidate>
          <div className="space-y-2">
            <label htmlFor="sp-password" className="text-sm font-medium">
              New password
            </label>
            <Input id="sp-password" type="password" autoComplete="new-password" {...register('password')} />
            <p className="text-xs text-gray-500">{PASSWORD_HINT}</p>
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="sp-confirm" className="text-sm font-medium">
              Confirm new password
            </label>
            <Input id="sp-confirm" type="password" autoComplete="new-password" {...register('confirm')} />
            {errors.confirm && <p className="text-sm text-red-600">{errors.confirm.message}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="sp-current" className="text-sm font-medium">
              Your current password
            </label>
            <Input id="sp-current" type="password" autoComplete="current-password" {...register('current_password')} />
            {errors.current_password && <p className="text-sm text-red-600">{errors.current_password.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Set password'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
