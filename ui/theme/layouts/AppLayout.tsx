import { Links, Meta, Scripts, ScrollRestoration } from 'react-router';
import { Theme } from '@radix-ui/themes';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from 'core/utils/queryClient';
import useAppLayout from 'ui/theme/layouts/hooks/useAppLayout';
import ProtectedRoutes from './ProtectedRoutes';

interface AppLayoutProps {
  children: React.ReactNode;
  theme?: 'light' | 'dark';
}

/**
 * Main layout component that renders the HTML shell and global providers.
 * Handles theme management.
 *
 * @component
 * @param {AppLayoutProps} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {JSX.Element} The application shell with theme and query providers
 */
export function AppLayout({ children }: AppLayoutProps) {
  const { resolvedTheme } = useAppLayout();

  return (
    <html lang={'en'} dir={'ltr'}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Theme appearance={resolvedTheme}>
          <QueryClientProvider client={queryClient}>
            <ProtectedRoutes>{children}</ProtectedRoutes>
          </QueryClientProvider>
        </Theme>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
