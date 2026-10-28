import api from '@utils/api';
import type { User } from 'core/types/user.types';
import type { ApiResponse } from 'core/types/api.types';
import type { ReadUsersQuery } from 'infrastructure/api';

export const usersApi = {
  getUsers: (params?: ReadUsersQuery) => {
    return api.get<ApiResponse<User[]>>('/users', {
      params,
    });
  },
  getUser: (id: number) => api.get<User>(`/users/${id}`),

  // Hard-deleting another user requires the admin's own password (step-up)
  deleteUser: (id: number, current_password: string) =>
    api.delete(`/users/${id}`, { data: { current_password } }),
};
