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

/** Returns the URL only when it is a plain http(s)/mailto/tel link, so it is safe as an href. */
export function safeHref(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  return /^\s*(https?:|mailto:|tel:)/i.test(url) ? url : undefined;
}
