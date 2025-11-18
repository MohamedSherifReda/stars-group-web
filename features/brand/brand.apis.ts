import api from '@utils/api';
import type { ApiResponse } from 'core/types/api.types';
import type { Brand } from 'core/types/brand.types';

export const brandsApi = {
  getBrands: (params?: Record<string, any>) => {
    return api.get<ApiResponse<Brand[]>>('/brands', { params });
  },

  getBrand: (id: number, params?: Record<string, any>) =>
    api.get<Brand>(`/brands/${id}`, { params }),

  createBrand: (brand: Partial<Brand>) => api.post<Brand>('/brands', brand),

  updateBrand: (id: number, brand: Partial<Brand>) =>
    api.patch<Brand>(`/brands/${id}`, brand),

  deleteBrand: (id: number) => api.delete(`/brands/${id}/soft`),
};
