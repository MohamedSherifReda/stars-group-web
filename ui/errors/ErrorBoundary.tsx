import { isRouteErrorResponse } from 'react-router';

interface ErrorBoundaryProps {
  error: Error;
}

/**
 * Global error boundary component that catches errors in the app
 * and displays a fallback UI.
 *
 * @param {ErrorBoundaryProps} props - Component props
 * @param {Error} props.error - The caught error
 * @returns {JSX.Element} Error display component
 */
export function ErrorBoundaryFunc({ error }: ErrorBoundaryProps) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack;
  let status = 500;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    message = error.status === 404 ? '404' : `Error ${error.status}`;
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details;
  } else if (error instanceof Error) {
    details = error.message;
    if (import.meta.env.DEV) {
      stack = error.stack;
    }
  }

  return (
    <main
      style={{
        padding: '2rem 1rem',
        maxWidth: '1200px',
        margin: '0 auto',
        minHeight: '100vh',
      }}
    >
      <h1
        style={{
          fontSize: '2rem',
          fontWeight: 700,
          marginBottom: '1rem',
          color: '#dc2626',
        }}
      >
        {message}
      </h1>

      <p
        style={{
          marginBottom: '1rem',
          color: '#4b5563',
          fontSize: '1.125rem',
        }}
      >
        {details}
      </p>

      {stack && (
        <pre
          style={{
            width: '100%',
            padding: '1rem',
            overflowX: 'auto',
            backgroundColor: '#f3f4f6',
            borderRadius: '0.5rem',
            fontFamily: 'monospace',
            color: '#1f2937',
            fontSize: '0.875rem',
            lineHeight: 1.5,
            marginTop: '1.5rem',
          }}
        >
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
