import { z } from 'zod';

/** Same policy as the API: 8+ characters with upper, lower, digit and special character. */
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;

export const PASSWORD_HINT =
  'At least 8 characters with an uppercase letter, a lowercase letter, a number and a special character.';

export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .regex(PASSWORD_REGEX, PASSWORD_HINT);

/** Best-effort readable message from an API error (never echoes request data). */
export function apiErrorMessage(error: any, fallback: string): string {
  const message = error?.response?.data?.message;
  if (Array.isArray(message)) return String(message[0] ?? fallback);
  if (typeof message === 'string' && message) return message;
  if (error?.response?.status === 429) return 'Too many attempts, please try again later';
  return fallback;
}
