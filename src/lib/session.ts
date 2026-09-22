/**
 * Admin sessions and the Google-account allowlist.
 *
 * Sessions are opaque random ids stored in D1, not signed blobs, so deleting the
 * row revokes access immediately. The cookie carries nothing but the id.
 */

import type { AstroCookies } from 'astro';

export const SESSION_COOKIE = '__Host-ruina_session';
export const OAUTH_STATE_COOKIE = '__Host-ruina_oauth_state';

const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
const STATE_TTL_SECONDS = 10 * 60;

/** Hex-encoded random id. 32 bytes is far beyond guessable. */
function randomId(): string {
	const bytes = new Uint8Array(32);
	crypto.getRandomValues(bytes);
	return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * `__Host-` requires the Secure attribute, which browsers refuse over plain
 * http. Local dev runs on http://localhost, so fall back to an unprefixed name
 * there and keep the hardened one everywhere else.
 */
export function cookieNames(url: URL): { session: string; state: string; secure: boolean } {
	const secure = url.protocol === 'https:';
	return {
		session: secure ? SESSION_COOKIE : 'ruina_session',
		state: secure ? OAUTH_STATE_COOKIE : 'ruina_oauth_state',
		secure,
	};
}

export type AdminSession = { id: string; email: string };

export function isAllowedAdmin(email: string, allowlist: string): boolean {
	const allowed = allowlist
		.split(',')
		.map((entry) => entry.trim().toLowerCase())
		.filter((entry) => entry.length > 0);
	return allowed.includes(email.trim().toLowerCase());
}

export async function createSession(db: D1Database, email: string): Promise<string> {
	const id = randomId();
	const now = new Date();
	const expires = new Date(now.getTime() + SESSION_TTL_SECONDS * 1000);

	await db
		.prepare('INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?1, ?2, ?3, ?4)')
		.bind(id, email.toLowerCase(), now.toISOString(), expires.toISOString())
		.run();

	// Opportunistic cleanup; there is no cron on the free plan and the table is tiny.
	await db
		.prepare('DELETE FROM sessions WHERE expires_at < ?1')
		.bind(now.toISOString())
		.run()
		.catch(() => undefined);

	return id;
}

export async function getSession(db: D1Database, id: string): Promise<AdminSession | null> {
	const row = await db
		.prepare('SELECT id, email, expires_at FROM sessions WHERE id = ?1')
		.bind(id)
		.first<{ id: string; email: string; expires_at: string }>();

	if (row === null) return null;
	if (Date.parse(row.expires_at) <= Date.now()) {
		await deleteSession(db, id).catch(() => undefined);
		return null;
	}
	return { id: row.id, email: row.email };
}

export async function deleteSession(db: D1Database, id: string): Promise<void> {
	await db.prepare('DELETE FROM sessions WHERE id = ?1').bind(id).run();
}

export function setSessionCookie(cookies: AstroCookies, url: URL, id: string): void {
	const names = cookieNames(url);
	cookies.set(names.session, id, {
		httpOnly: true,
		secure: names.secure,
		sameSite: 'lax',
		path: '/',
		maxAge: SESSION_TTL_SECONDS,
	});
}

export function clearSessionCookie(cookies: AstroCookies, url: URL): void {
	const names = cookieNames(url);
	cookies.delete(names.session, { path: '/' });
}

export function setStateCookie(cookies: AstroCookies, url: URL, state: string): void {
	const names = cookieNames(url);
	cookies.set(names.state, state, {
		httpOnly: true,
		secure: names.secure,
		sameSite: 'lax',
		path: '/',
		maxAge: STATE_TTL_SECONDS,
	});
}

export function readStateCookie(cookies: AstroCookies, url: URL): string | undefined {
	return cookies.get(cookieNames(url).state)?.value;
}

export function clearStateCookie(cookies: AstroCookies, url: URL): void {
	cookies.delete(cookieNames(url).state, { path: '/' });
}

/** Resolves the current admin session, or null when there is none. */
export async function currentAdmin(
	db: D1Database,
	cookies: AstroCookies,
	url: URL,
): Promise<AdminSession | null> {
	const id = cookies.get(cookieNames(url).session)?.value;
	if (!id) return null;
	return getSession(db, id);
}

/**
 * Cross-origin guard for state-changing admin requests. SameSite=Lax already
 * blocks cross-site POSTs in current browsers; this closes the gap for clients
 * that do not enforce it.
 */
export function isSameOrigin(request: Request, url: URL): boolean {
	const origin = request.headers.get('origin');
	if (origin === null) return true; // Same-origin fetches may omit Origin entirely.
	try {
		return new URL(origin).origin === url.origin;
	} catch {
		return false;
	}
}
