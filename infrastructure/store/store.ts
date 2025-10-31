import { create } from 'zustand';
import { createThemeSlice, type ThemeSlice } from './themeSlice';
import { persist } from 'zustand/middleware';

export type PersistedStoreState = ThemeSlice & {};
export type GlobalStoreState = ThemeSlice;

export const usePersistedStore = create<PersistedStoreState>()(
  persist((...a) => ({ ...createThemeSlice(...a) }), { name: 'store' })
);

export const useGlobalStore = create<GlobalStoreState>((...a) => ({
  ...createThemeSlice(...a),
}));

export type { ThemeSlice };
