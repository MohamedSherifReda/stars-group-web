import type { Media } from "./common.types"

export interface Banner {
  id: number
  promotion_name: string
  redirect_url?: string
  image_en_id: number
  image_ar_id: number
  created_at: string
  updated_at: string
  image_en?: Media
  image_ar?: Media
}