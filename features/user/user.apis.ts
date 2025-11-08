import api from '@utils/api';
import type { User } from 'core/types/user.types';
import type { PaginatedResponse } from 'core/types/api.types';

export interface GetUsersParams {
  'pagination[take]'?: number;
  'pagination[skip]'?: number;
}

export const usersApi = {
  getUsers: (params?: GetUsersParams) => {
    return api.get<PaginatedResponse<User>>('/users', {
      params,
    });
  },
  getUser: (id: number) => api.get<User>(`/users/${id}`),
};
