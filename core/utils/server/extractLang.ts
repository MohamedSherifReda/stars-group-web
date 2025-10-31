import {
  DEFAULT_LANG,
  supportedLanguages,
  type SupportedLanguages,
} from 'infrastructure/i18n/supported';
import ar from '../../../infrastructure/i18n/ar.json';
import en from '../../../infrastructure/i18n/en.json';

const langs = { ar, en };

export function extractLang(request: Request | Location) {
  if (request instanceof Request) {
    const lang = new URL(request.url).pathname.split(
      '/'
    )[1] as SupportedLanguages;
    if (supportedLanguages.includes(lang)) {
      const t = langs[lang];
      return { lang: lang, t };
    }
  } else if (request?.pathname) {
    const lang = request.pathname.split('/')[1] as SupportedLanguages;
    if (supportedLanguages.includes(lang)) {
      const t = langs[lang];
      return { lang: lang, t };
    }
  }

  return {
    lang: DEFAULT_LANG as SupportedLanguages,
    t: langs[DEFAULT_LANG],
    redirect: true,
  };
}
