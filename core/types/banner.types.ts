import type { Brand } from './brand.types';
import type { Media } from './common.types';

export interface Banner {
  id: number;
  promotion_name: string;
  redirect_url?: string | null;
  image_en_id: number;
  image_ar_id: number;
  created_at: string;
  updated_at: string;
  image_en?: Media;
  image_ar?: Media;
  brand_id?: number | string | null;
  /**
   * When true, the banner is disabled and should NOT appear to end users.
   * When false or undefined, the banner is considered enabled/active.
   */
  disabled?: boolean;
  brand?: Brand;
}
