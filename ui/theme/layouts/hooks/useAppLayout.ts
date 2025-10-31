import { useCallback, useEffect, useMemo } from 'react';
import { useRouteLoaderData } from 'react-router';
import type { loader } from '~/root';
import { usePersistedStore } from 'infrastructure/store/store';

export default function useAppLayout() {
  const serverData = useRouteLoaderData<typeof loader>('root');
  const { mode: theme, setMode: setTheme } = usePersistedStore();

  const resolvedTheme = useMemo(
    () => theme || serverData?.theme || 'light',
    [theme, serverData?.theme]
  );


  const initializeTheme = useCallback(() => {
    if (!theme && serverData?.theme) {
      setTheme(serverData.theme);
    }
  }, [theme, serverData?.theme, setTheme]);

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return {
    resolvedTheme,
  };
}
