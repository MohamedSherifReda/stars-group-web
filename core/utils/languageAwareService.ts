import type { SupportedLanguages } from 'infrastructure/i18n/supported';

class LanguageAwareService {
  private static DEFAULT_LANGUAGE: SupportedLanguages = 'en';

  /**
   * Gets the properly formatted language parameter for API calls
   * @param lang The requested language
   * @returns The language parameter string or empty string if default language
   */
  protected static getLanguageParam(lang?: SupportedLanguages): string {
    // If no language specified or it's the default language, return empty string
    if (!lang || lang === this.DEFAULT_LANGUAGE) {
      return '';
    }
    return `&locale=${lang}`;
  }
}

export default LanguageAwareService;
