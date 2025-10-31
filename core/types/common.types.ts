import type { ThemeSlice } from 'infrastructure/store/themeSlice';

export interface LoaderData {
  theme: ThemeSlice['mode'];
  lang: string;
  t: (key: string) => string;
}

export interface LoaderReturnType extends Response {
  json(): Promise<LoaderData>;
}

export interface Media {
  id: number
  filename: string
  original_name: string
  mime_type: string
  size: number
  url: string
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}