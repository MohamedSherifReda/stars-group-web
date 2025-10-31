import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

type ErrorLike = Error | AxiosError | unknown;

interface ErrorHandlerOptions {
  defaultMessage?: string;
  showToast?: boolean;
  logError?: boolean;
}

/**
 * Handles application errors with consistent formatting and behavior
 *
 * @param {ErrorLike} error - The error to handle
 * @param {ErrorHandlerOptions} options - Configuration options
 * @returns {void}
 */
export const handleError = (
  error: ErrorLike,
  options: ErrorHandlerOptions = {}
): void => {
  const {
    defaultMessage = 'Something went wrong',
    showToast = true,
    logError = true,
  } = options;

  let message = defaultMessage;
  let status: number | undefined;
  let code: string | undefined;

  // Log error to console in development
  if (logError && import.meta.env.DEV) {
    console.error('[Error Handler]:', error);
  }

  // Handle Axios errors
  if (isAxiosError(error)) {
    status = error.response?.status;
    const data = error.response?.data as any;

    message =
      data?.error?.message || data?.message || error.message || defaultMessage;
    code = data?.error?.code;
  }
  // Handle standard Error objects
  else if (error instanceof Error) {
    message = error.message;
  }

  // Network error special case
  if (isNetworkError(error)) {
    message = 'Network connection error';
  }

  if (showToast) {
    showToastMessage(message, status);
  }
};

// Helper functions
const isAxiosError = (error: unknown): error is AxiosError => {
  return (error as AxiosError).isAxiosError === true;
};

const isNetworkError = (error: unknown): boolean => {
  return (error as Error)?.message === 'Network Error';
};

const showToastMessage = (message: string, status?: number): void => {
  const statusMessages: Record<number, string> = {
    400: 'Validation error: please check your input',
    401: 'Please log in to access this resource',
    403: 'You are not authorized to perform this action',
    404: 'The requested resource was not found',
    429: 'Too many requests, please try again later',
    500: 'Server error, please try again later',
    502: 'Bad gateway, please try again later',
    503: 'Service unavailable, please try again later',
  };

  const finalMessage = statusMessages[status!] || message;
  toast.error(finalMessage);
};

// Convenience functions
export const showErrorToast = (error: unknown) => {
  handleError(error, { showToast: true });
};

export const logError = (error: unknown) => {
  handleError(error, { showToast: false, logError: true });
};
