import { randomBytes } from 'node:crypto';
import { PassThrough } from 'node:stream';

import type { AppLoadContext, EntryContext } from 'react-router';
import { createReadableStreamFromReadable } from '@react-router/node';
import { ServerRouter } from 'react-router';
import { isbot } from 'isbot';
import type { RenderToPipeableStreamOptions } from 'react-dom/server';
import { renderToPipeableStream } from 'react-dom/server';

export const streamTimeout = 5_000;

/** Origin of the API (VITE_BASE_URL), the only cross-origin host the app talks to. */
function apiOrigin(): string {
	try {
		return new URL(import.meta.env.VITE_BASE_URL).origin;
	} catch {
		return '';
	}
}

/**
 * Security headers for HTML responses. The CSP is strict (no unsafe-inline/eval for
 * scripts: the inline hydration scripts carry a per-request nonce) and allows only what
 * the CMS actually loads:
 *  - TinyMCE Cloud (cdn.tiny.cloud scripts/styles/fonts, sp.tinymce.com images)
 *  - the API origin (XHR + images served from /assets)
 *  - data:/blob: images
 * style-src needs 'unsafe-inline' because Radix/TinyMCE/React set inline styles.
 * frame-ancestors + X-Frame-Options stop the CMS from being framed (clickjacking).
 */
function applySecurityHeaders(headers: Headers, nonce: string) {
	const api = apiOrigin();
	const csp = [
		"default-src 'self'",
		`script-src 'self' 'nonce-${nonce}' https://cdn.tiny.cloud`,
		"style-src 'self' 'unsafe-inline' https://cdn.tiny.cloud",
		`img-src 'self' data: blob: ${api} https://sp.tinymce.com https://cdn.tiny.cloud`.replace(/\s+/g, ' '),
		"font-src 'self' data: https://cdn.tiny.cloud",
		`connect-src 'self' ${api} https://cdn.tiny.cloud https://*.tiny.cloud`.replace(/\s+/g, ' '),
		"frame-src 'self' about: blob:",
		"worker-src 'self' blob:",
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'self'",
		"frame-ancestors 'none'",
	].join('; ');
	headers.set('Content-Security-Policy', csp);
	headers.set('X-Frame-Options', 'DENY');
	headers.set('X-Content-Type-Options', 'nosniff');
	headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
	headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
}

export default function handleRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	routerContext: EntryContext,
	loadContext: AppLoadContext
) {
	return new Promise((resolve, reject) => {
		let shellRendered = false;
		let userAgent = request.headers.get('user-agent');
		const nonce = randomBytes(16).toString('base64');
		// The Vite dev server injects un-nonced inline scripts (HMR), so the CSP is production-only
		if (import.meta.env.PROD) applySecurityHeaders(responseHeaders, nonce);

		// Ensure requests from bots and SPA Mode renders wait for all content to load before responding
		// https://react.dev/reference/react-dom/server/renderToPipeableStream#waiting-for-all-content-to-load-for-crawlers-and-static-generation
		let readyOption: keyof RenderToPipeableStreamOptions =
			(userAgent && isbot(userAgent)) || routerContext.isSpaMode ? 'onAllReady' : 'onShellReady';

		const { pipe, abort } = renderToPipeableStream(
			<ServerRouter
				context={routerContext}
				url={request.url}
				nonce={nonce}
			/>,
			{
				nonce,
				[readyOption]() {
					shellRendered = true;
					const body = new PassThrough();
					const stream = createReadableStreamFromReadable(body);

					responseHeaders.set('Content-Type', 'text/html');

					resolve(
						new Response(stream, {
							headers: responseHeaders,
							status: responseStatusCode,
						})
					);

					pipe(body);
				},
				onShellError(error: unknown) {
					reject(error);
				},
				onError(error: unknown) {
					responseStatusCode = 500;
					// Log streaming rendering errors from inside the shell.  Don't log
					// errors encountered during initial shell rendering since they'll
					// reject and get logged in handleDocumentRequest.
					if (shellRendered) {
						console.error(error);
					}
				},
			}
		);

		// Abort the rendering stream after the `streamTimeout` so it has tine to
		// flush down the rejected boundaries
		setTimeout(abort, streamTimeout + 1000);
	});
}
