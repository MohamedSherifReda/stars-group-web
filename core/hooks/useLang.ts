import { useParams, useRouteLoaderData } from 'react-router';
import {
  DEFAULT_LANG,
  type SupportedLanguages,
} from '../../infrastructure/i18n/supported';

export function useLang() {
  const url = useParams();
  const t = useRouteLoaderData('root')?.t || {
    error: 'No translation file found',
  };

  return { lang: (url.lang as SupportedLanguages) || DEFAULT_LANG, t };
}
