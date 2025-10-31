import { Link as RouterLink } from 'react-router';
import { useLang } from 'core/hooks/useLang';

const Link = ({
  to,
  className,
  ...rest
}: {
  to: string | { pathname: string };
  className?: string;
  [key: string]: any;
}) => {
  const { lang: currentLanguage } = useLang();

  const pathname = typeof to === 'string' ? to : to.pathname;

  const newPath = `/${currentLanguage}${pathname}`;

  const newTo = typeof to === 'string' ? newPath : { ...to, pathname: newPath };

  return <RouterLink to={newTo} {...rest} className={className} />;
};

export default Link;
