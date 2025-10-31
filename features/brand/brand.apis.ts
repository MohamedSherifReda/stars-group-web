import api from '@utils/api';
import type { Brand } from 'core/types/brand.types';

export const brandsApi = {
  getBrands: (params?: Record<string, any>) => {
    const mockData: Brand[] = [
      {
        id: 1,
        name: 'Brand 1',
        heading_title: 'Heading 1',
        description: 'Description 1',
        gradient_hex: '#000000',
        updated_at: '2022-01-01T00:00:00.000Z',
        created_at: '2022-01-01T00:00:00.000Z',
      },
    ];

    // api.get<Brand[]>('/brands', { params }),
    return Promise.resolve({ data: mockData });
  },

  getBrand: (id: number, params?: Record<string, any>) =>
    api.get<Brand>(`/brands/${id}`, { params }),

  createBrand: (brand: Partial<Brand>) => api.post<Brand>('/brands', brand),

  updateBrand: (id: number, brand: Partial<Brand>) =>
    api.patch<Brand>(`/brands/${id}`, brand),

  deleteBrand: (id: number) => api.delete(`/brands/${id}/soft`),
};
