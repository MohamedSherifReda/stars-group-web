import api from '@utils/api';

export interface CmsUser {
  id: number;
  name: string | null;
  email: string | null;
  phone_number: string | null;
  is_logged_in: boolean;
  created_at: string;
  updated_at: string;
}

export interface CmsInvitation {
  id: number;
  email: string;
  name: string | null;
  created_at: string;
  expires_at: string;
  is_expired: boolean;
  invited_by_name: string | null;
}

/** `invite_link` is only present when the email could not be sent. */
export interface InvitationDelivery {
  email_sent: boolean;
  invite_link?: string;
}

export const cmsUsersApi = {
  list: () => api.get<{ data: CmsUser[] }>('/cms-users'),
  listInvitations: () => api.get<{ data: CmsInvitation[] }>('/cms-users/invitations'),
  invite: (body: { email: string; name?: string }) =>
    api.post<InvitationDelivery>('/cms-users/invitations', body),
  resendInvitation: (id: number) =>
    api.post<InvitationDelivery>(`/cms-users/invitations/${id}/resend`),
  revokeInvitation: (id: number) => api.delete(`/cms-users/invitations/${id}`),
  // current_password is the signed-in admin's own password (step-up)
  setPassword: (id: number, body: { password: string; current_password: string }) =>
    api.patch(`/cms-users/${id}/password`, body),
};
