import type { Route } from '.react-router/types/app/+types/root';
import { data } from 'react-router';
import {
  themeCookieMaxAge,
  type ThemeSlice,
} from 'infrastructure/store/themeSlice';
import { getCookie } from 'core/utils/server/cookies';

/**
 * Server-side loader function for root layout that handles:
 * - Theme cookie management
 * - Initial data provisioning for client-side hydration
 *
 * @param {Route.LoaderArgs} args - Loader arguments from React Router
 * @returns {Promise<Response>} Response with layout data and cookies
 */
export const serveLayoutSSR = async ({ request }: Route.LoaderArgs) => {
  // Theme cookie extraction with fallback
  const theme = getCookie(request, 'theme') || 'light';

  return data(
    {
      theme: theme as ThemeSlice['mode'],
    },
    {
      headers: {
        'Set-Cookie': `theme=${theme}; Max-age=${themeCookieMaxAge}; path=/`,
      },
    }
  );
};
