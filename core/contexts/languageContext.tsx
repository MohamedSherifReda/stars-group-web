import { createContext } from 'react';

export interface LangContext {
	lang: 'ar' | 'en';
	t: Record<string, string>;
}
export const defaultLangContext: LangContext = {
	lang: 'ar',
	t: {},
};
export const LanguageContext = createContext(defaultLangContext);
