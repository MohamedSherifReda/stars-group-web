import type { MediaEntity } from "infrastructure/api/types.gen";

export interface OnboardingImage {
  id: number;
  image_id: number;
  display_order: number;
  image: MediaEntity;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateOnboardingImage {
  image_id: number;
  display_order?: number;
}

export interface UpdateOnboardingImage {
  image_id?: number;
  display_order?: number;
}

export interface ReorderOnboardingImages {
  images: Array<{
    id: number;
    display_order: number;
  }>;
}
