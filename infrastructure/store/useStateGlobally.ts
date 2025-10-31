import { create } from 'zustand';

interface NewsSearchState {
  search: string;
  setSearch: (search: string) => void;
}

export const useNewsSearchSlice = create<NewsSearchState>((set) => ({
  search: '',
  setSearch: (search: string) => set({ search }),
}));
