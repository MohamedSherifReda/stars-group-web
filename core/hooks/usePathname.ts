import { supportedLanguages } from '../../infrastructure/i18n/supported';
import { useLocation } from 'react-router';

export const usePathname = () => {
  const { pathname } = useLocation();

  const pathnameWithoutLang = pathname.replace(`/${supportedLanguages[0]}`, '');

  return pathnameWithoutLang || '/';
};
