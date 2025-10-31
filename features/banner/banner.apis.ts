import api from '@utils/api';
import type { Banner } from 'core/types/banner.types';

export const bannersApi = {
  getBanners: (params?: Record<string, any>) => {
    const mockData: Banner[] = [
      {
        id: 1,
        promotion_name: 'Banner 1',
        redirect_url: 'https://example.com',
        image_en_id: 1,
        image_ar_id: 2,
        created_at: '2022-01-01T00:00:00.000Z',
        updated_at: '2022-01-01T00:00:00.000Z',
      },
    ];

    return Promise.resolve({ data: mockData });
    // api.get<Banner[]>('/banners', { params })
  },

  getBanner: (id: number, params?: Record<string, any>) =>
    api.get<Banner>(`/banners/${id}`, { params }),

  createBanner: (banner: Partial<Banner>) =>
    api.post<Banner>('/banners', banner),

  updateBanner: (id: number, banner: Partial<Banner>) =>
    api.patch<Banner>(`/banners/${id}`, banner),

  deleteBanner: (id: number) => api.delete(`/banners/${id}`),
};
