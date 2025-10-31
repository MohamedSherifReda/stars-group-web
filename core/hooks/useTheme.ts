import { useRouteLoaderData } from 'react-router';
import type { loader } from '~/root';
import { usePersistedStore } from 'infrastructure/store/store';

function useTheme() {
  const { mode: theme, setMode: setTheme } = usePersistedStore();
  const serverData = useRouteLoaderData<typeof loader>('root');

  return {
    theme: theme || serverData?.theme || 'light',
    setTheme,
    isDark: (theme || serverData?.theme) === 'dark',
  };
}

export default useTheme;
