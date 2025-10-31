import type { SupportedLanguages } from 'infrastructure/i18n/supported';

export function useTextDirection(lang?: SupportedLanguages) {
  return lang === 'ar' ? 'rtl' : 'ltr';
}
