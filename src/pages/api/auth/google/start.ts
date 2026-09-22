/**
 * Begins the Google sign-in for /admin.
 *
 * The `state` value is stored in an HttpOnly cookie and compared on the way
 * back, so a callback that did not originate here is rejected.
 */

import type { APIRoute } from 'astro';
import { buildAuthUrl, redirectUriFor } from '../../../../lib/google';
import { setStateCookie } from '../../../../lib/session';

export const prerender = false;

/** Only same-site absolute paths, so `next` can never become an open redirect. */
function safeNext(raw: string | null): string {
	if (raw === null) return '/admin';
	if (!raw.startsWith('/') || raw.startsWith('//')) return '/admin';
	return raw;
}

export const GET: APIRoute = ({ url, cookies, locals, redirect }) => {
	const env = locals.runtime.env;

	if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
		return new Response(
			'Google sign-in is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.',
			{ status: 500, headers: { 'Content-Type': 'text/plain' } },
		);
	}

	const nonce = crypto.randomUUID();
	// The state carries the post-login destination as well as the CSRF nonce.
	const state = `${nonce}:${safeNext(url.searchParams.get('next'))}`;
	setStateCookie(cookies, url, state);

	return redirect(buildAuthUrl(env, redirectUriFor(url), state), 302);
};
