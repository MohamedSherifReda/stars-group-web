import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { KeyRound, Mail, RotateCw, UserPlus, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/common/card';
import { Badge } from '@ui/common/badge';
import { Button } from '@ui/common/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/common/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@ui/common/dialog';
import { cmsUsersApi, type CmsUser } from '@features/cms-users/cms-users.apis';
import InviteUserDialog, { InviteLinkNotice } from '@features/cms-users/components/InviteUserDialog';
import SetPasswordDialog from '@features/cms-users/components/SetPasswordDialog';
import { apiErrorMessage } from '@utils/password';
import { useAuthStore } from 'infrastructure/store/auth';
import serveAdminsMeta from '~/meta/serveAdminsMeta';

export const meta = serveAdminsMeta;

const fmt = (d: string) => format(new Date(d), 'MMM dd, yyyy HH:mm');

export default function Admins() {
  const queryClient = useQueryClient();
  const me = useAuthStore((s) => s.user);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [passwordFor, setPasswordFor] = useState<CmsUser | null>(null);
  const [resentLink, setResentLink] = useState<string | null>(null);

  const users = useQuery({
    queryKey: ['cms-users'],
    queryFn: () => cmsUsersApi.list().then((r) => r.data.data),
  });
  const invitations = useQuery({
    queryKey: ['cms-invitations'],
    queryFn: () => cmsUsersApi.listInvitations().then((r) => r.data.data),
  });

  const resend = useMutation({
    mutationFn: (id: number) => cmsUsersApi.resendInvitation(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['cms-invitations'] });
      if (res.data.email_sent) toast.success('Invitation re-sent');
      else if (res.data.invite_link) setResentLink(res.data.invite_link);
    },
    onError: (e: any) => toast.error(apiErrorMessage(e, 'Failed to resend invitation')),
  });
  const revoke = useMutation({
    mutationFn: (id: number) => cmsUsersApi.revokeInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-invitations'] });
      toast.success('Invitation revoked');
    },
    onError: (e: any) => toast.error(apiErrorMessage(e, 'Failed to revoke invitation')),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CMS Users</h1>
          <p className="mt-2 text-gray-600">Invite colleagues to the CMS and manage their access.</p>
        </div>
        <Button onClick={() => setInviteOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Invite user
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CMS users</CardTitle>
          <CardDescription>Everyone who can sign in to this CMS.</CardDescription>
        </CardHeader>
        <CardContent>
          {users.isLoading ? (
            <div className="py-8 text-center text-gray-500">Loading...</div>
          ) : users.isError ? (
            <div className="py-8 text-center text-red-600">Failed to load CMS users</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(users.data ?? []).map((u) => {
                  const isSelf = u.id === me?.id;
                  return (
                    <TableRow key={u.id}>
                      <TableCell>
                        {u.name || '-'} {isSelf && <Badge variant="secondary" className="ml-2">You</Badge>}
                      </TableCell>
                      <TableCell>{u.email || '-'}</TableCell>
                      <TableCell>{u.phone_number || '-'}</TableCell>
                      <TableCell>{fmt(u.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          disabled={isSelf}
                          title={isSelf ? 'Use My account in Settings to change your own password' : undefined}
                          onClick={() => setPasswordFor(u)}
                        >
                          <KeyRound className="h-4 w-4" />
                          Set password
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending invitations</CardTitle>
          <CardDescription>Invitations that have not been accepted yet.</CardDescription>
        </CardHeader>
        <CardContent>
          {invitations.isLoading ? (
            <div className="py-8 text-center text-gray-500">Loading...</div>
          ) : (invitations.data ?? []).length === 0 ? (
            <div className="py-8 text-center text-gray-500">No pending invitations</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Invited by</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(invitations.data ?? []).map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      {i.email}
                    </TableCell>
                    <TableCell>{i.name || '-'}</TableCell>
                    <TableCell>{i.invited_by_name || '-'}</TableCell>
                    <TableCell>{fmt(i.expires_at)}</TableCell>
                    <TableCell>
                      {i.is_expired ? <Badge variant="destructive">Expired</Badge> : <Badge variant="secondary">Pending</Badge>}
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        disabled={resend.isPending}
                        onClick={() => resend.mutate(i.id)}
                      >
                        <RotateCw className="h-4 w-4" />
                        Resend
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-red-600"
                        disabled={revoke.isPending}
                        onClick={() => revoke.mutate(i.id)}
                      >
                        <X className="h-4 w-4" />
                        Revoke
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <InviteUserDialog open={inviteOpen} onOpenChange={setInviteOpen} />
      <SetPasswordDialog user={passwordFor} onClose={() => setPasswordFor(null)} />

      <Dialog open={!!resentLink} onOpenChange={(o) => !o && setResentLink(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitation link</DialogTitle>
            <DialogDescription>A new link was created for this invitation.</DialogDescription>
          </DialogHeader>
          {resentLink && <InviteLinkNotice link={resentLink} onDone={() => setResentLink(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
