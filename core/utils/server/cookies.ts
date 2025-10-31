import type { CookieOptions } from 'core/types/server.types';

/**
 * Extracts a cookie value from request headers
 *
 * @param {Request} request - Incoming request
 * @param {string} name - Cookie name to extract
 * @returns {string | undefined} Cookie value if found
 */
export function getCookie(request: Request, name: string): string | undefined {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return undefined;

  const cookies = cookieHeader.split(';').map((c) => c.trim());
  const cookie = cookies.find((c) => c.startsWith(`${name}=`));

  return cookie?.split('=')[1];
}

/**
 * Generates a Set-Cookie header value with options
 *
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {CookieOptions} options - Cookie configuration
 * @returns {string} Formatted Set-Cookie header value
 */
export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): string {
  const parts = [`${name}=${value}`];

  if (options.maxAge) parts.push(`Max-Age=${options.maxAge}`);
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.secure) parts.push('Secure');
  if (options.httpOnly) parts.push('HttpOnly');
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);

  return parts.join('; ');
}
