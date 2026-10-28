import DOMPurify from 'dompurify';

/**
 * Sanitizes CMS rich text (terms, privacy policy) before it is rendered with
 * dangerouslySetInnerHTML. Strips scripts, event handlers and javascript: URLs.
 * The content is fetched on the client, so the server render has nothing to sanitize.
 */
export function sanitizeRichText(html: string | null | undefined): string {
  if (!html || typeof window === 'undefined') return '';
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}

const parseUrl = (url: string): URL | null => {
  try {
    return new URL(url.trim());
  } catch {
    return null;
  }
};

/** Returns the URL only when it parses and is http(s)/mailto/tel, so it is safe as an href. */
export function safeHref(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  const parsed = parseUrl(url);
  if (!parsed) return undefined;
  return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)
    ? parsed.href
    : undefined;
}

/** Returns the URL only when it parses and is http(s). For <img src>, Excel cells and links to files. */
export function safeHttpUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  const parsed = parseUrl(url);
  return parsed && (parsed.protocol === 'http:' || parsed.protocol === 'https:')
    ? parsed.href
    : undefined;
}
