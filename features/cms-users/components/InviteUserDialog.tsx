import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Copy } from 'lucide-react';
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
import { apiErrorMessage } from '@utils/password';
import { cmsUsersApi } from '../cms-users.apis';

const schema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  name: z.string().trim().max(100, 'Name is too long').optional(),
});
type FormValues = z.infer<typeof schema>;

/** Copyable fallback link, shown when the invitation email could not be sent. */
export function InviteLinkNotice({ link, onDone }: { link: string; onDone?: () => void }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Link copied');
    } catch {
      toast.error('Could not copy, select the link and copy it manually');
    }
  };
  return (
    <div className="space-y-3">
      <p className="text-sm text-amber-700">
        The email could not be sent. Share this link with the invited user yourself. It is shown only once.
      </p>
      <div className="flex gap-2">
        <Input readOnly value={link} aria-label="Invitation link" onFocus={(e) => e.target.select()} />
        <Button type="button" variant="outline" onClick={copy} aria-label="Copy invitation link">
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      {onDone && (
        <DialogFooter>
          <Button type="button" onClick={onDone}>
            Done
          </Button>
        </DialogFooter>
      )}
    </div>
  );
}

export default function InviteUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [link, setLink] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: '', name: '' } });

  useEffect(() => {
    if (!open) {
      reset({ email: '', name: '' });
      setLink(null);
    }
  }, [open, reset]);

  const invite = useMutation({
    mutationFn: (values: FormValues) =>
      cmsUsersApi.invite({ email: values.email, ...(values.name ? { name: values.name } : {}) }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['cms-invitations'] });
      if (res.data.email_sent) {
        toast.success('Invitation sent');
        onOpenChange(false);
      } else if (res.data.invite_link) {
        setLink(res.data.invite_link);
      }
    },
    onError: (error: any) => toast.error(apiErrorMessage(error, 'Failed to send invitation')),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite user</DialogTitle>
          <DialogDescription>
            The user receives an email with a link (valid for 72 hours) to set a password and join the CMS.
          </DialogDescription>
        </DialogHeader>
        {link ? (
          <InviteLinkNotice link={link} onDone={() => onOpenChange(false)} />
        ) : (
          <form onSubmit={handleSubmit((v) => invite.mutate(v))} className="space-y-4" noValidate>
            <div className="space-y-2">
              <label htmlFor="invite-email" className="text-sm font-medium">
                Email
              </label>
              <Input id="invite-email" type="email" autoComplete="off" placeholder="name@example.com" {...register('email')} />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="invite-name" className="text-sm font-medium">
                Name (optional)
              </label>
              <Input id="invite-name" autoComplete="off" {...register('name')} />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={invite.isPending}>
                {invite.isPending ? 'Sending...' : 'Send invitation'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
