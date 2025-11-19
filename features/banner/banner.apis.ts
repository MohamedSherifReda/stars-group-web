import api from '@utils/api';
import type { ApiResponse } from 'core/types/api.types';
import type { Banner } from 'core/types/banner.types';

export const bannersApi = {
  getBanners: (params?: Record<string, any>) => {
    return api.get<ApiResponse<Banner[]>>('/banners', { params });
  },

  getBanner: (id: number, params?: Record<string, any>) =>
    api.get<ApiResponse<Banner>>(`/banners/${id}`, { params }),

  createBanner: (banner: Partial<Banner>) =>
    api.post<Banner>('/banners', banner),

  updateBanner: (id: number, banner: Partial<Banner>) =>
    api.patch<Banner>(`/banners/${id}`, banner),

  deleteBanner: (id: number) => api.delete(`/banners/${id}/soft`),
};
