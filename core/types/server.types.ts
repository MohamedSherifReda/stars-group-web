import type { ThemeSlice } from 'infrastructure/store/themeSlice';

export interface LayoutServerData {
  theme: ThemeSlice['mode'];
  lang: string;
  t: (key: string) => string;
}

export interface CookieOptions {
  maxAge?: number;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}
