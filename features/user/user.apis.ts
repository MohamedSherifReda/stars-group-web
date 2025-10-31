import api from '@utils/api';
import type { User } from 'core/types/user.types';

export const usersApi = {
  getUsers: () => {
    const mockUsers: User[] = [
      {
        id: 1,
        email: 'Kk7oH@example.com',
        name: 'John Doe',
        phone_number: '1234567890',
        role: 'admin',
        account_verified: true,
        created_at: '2022-01-01T00:00:00.000Z',
        updated_at: '2022-01-01T00:00:00.000Z',
      },
    ];
    // api.get<User[]>('/users')
    return Promise.resolve({ data: mockUsers });
  },
  getUser: (id: number) => api.get<User>(`/users/${id}`),
};
