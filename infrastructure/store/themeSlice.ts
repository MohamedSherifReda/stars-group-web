import type { StateCreator } from 'zustand';

export type ThemeSlice = {
	toggle: () => void;
	setMode: (mode: ThemeSlice['mode']) => void;
	mode: 'light' | 'dark' | 'inherit' | undefined;
};

export const themeCookieMaxAge = 5 * 365 * 24 * 60 * 60;

export const createThemeSlice: StateCreator<ThemeSlice, [], [], ThemeSlice> = (set) => {
	return {
		mode: undefined,
		setMode: (mode: ThemeSlice['mode']) => {
			set({ mode });
			if (typeof window !== 'undefined') {
				document.cookie = `theme=${mode}; Max-age=${themeCookieMaxAge}; path=/`;
			}
		},
		toggle: () =>
			set((state) => {
				const newMode = state.mode === 'light' ? 'dark' : 'light';
				if (typeof window !== 'undefined') {
					document.cookie = `theme=${newMode}; Max-age=${themeCookieMaxAge}; path=/`;
				}

				return {
					...state,
					mode: newMode,
				};
			}),
	};
};
