import type { Banner } from "./banner.types"
import type { Media } from "./common.types"

export interface Brand {
  id: number
  name: string
  heading_title: string
  description: string
  shop_url?: string
  gradient_hex: string
  logo_id?: number
  product_picture_id?: number
  created_at: string
  updated_at: string
  logo?: Media
  product_picture?: Media
  banners?: Banner[]
  brand_translations?: BrandTranslation[]
}

export interface BrandTranslation {
  id: number
  brand_id: number
  language: string
  name: string
  heading_title: string
  description: string
}