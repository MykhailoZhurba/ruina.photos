/** Ends the admin session. The D1 row is deleted, so the cookie is dead even if kept. */

import type { APIRoute } from 'astro';
import { clearSessionCookie, cookieNames, deleteSession, isSameOrigin } from '../../../lib/session';

export const prerender = false;

export const POST: APIRoute = async ({ request, url, cookies, locals, redirect }) => {
	if (!isSameOrigin(request, url)) {
		return new Response('Cross-origin request rejected.', { status: 403 });
	}

	const id = cookies.get(cookieNames(url).session)?.value;
	if (id) {
		await deleteSession(locals.runtime.env.DB, id).catch(() => undefined);
	}
	clearSessionCookie(cookies, url);

	return redirect('/', 302);
};
