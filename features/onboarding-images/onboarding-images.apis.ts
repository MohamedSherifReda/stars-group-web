import api from '@utils/api';
import type { ApiResponse } from 'core/types/api.types';
import type { 
  OnboardingImage, 
  CreateOnboardingImage, 
  UpdateOnboardingImage,
  ReorderOnboardingImages
} from 'core/types/onboarding-images.types';

export const onboardingImagesApi = {
  getOnboardingImages: (params?: Record<string, any>) => {
    return api.get<ApiResponse<OnboardingImage[]>>('/onboarding-images', { params });
  },

  getOnboardingImage: (id: number, params?: Record<string, any>) =>
    api.get<ApiResponse<OnboardingImage>>(`/onboarding-images/${id}`, { params }),

  createOnboardingImage: (data: CreateOnboardingImage) =>
    api.post<OnboardingImage>('/onboarding-images', data),

  updateOnboardingImage: (id: number, data: UpdateOnboardingImage) =>
    api.patch<OnboardingImage>(`/onboarding-images/${id}`, data),

  deleteOnboardingImage: (id: number) => 
    api.delete(`/onboarding-images/${id}/soft`),

  reorderOnboardingImages: (data: ReorderOnboardingImages) =>
    api.post('/onboarding-images/reorder', data),
};
