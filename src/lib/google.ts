/**
 * Google OAuth (authorisation-code flow) and the Calendar API.
 *
 * Everything here runs in the Worker. The client secret and the refresh token
 * never reach the browser; the admin page talks only to our own
 * /api/admin/calendar endpoint, which calls Google on its behalf.
 */

const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

/** `calendar` (not `.readonly`) because /admin creates and edits bookings. */
const SCOPES = ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/calendar'];

export type GoogleEnv = {
	GOOGLE_CLIENT_ID: string;
	GOOGLE_CLIENT_SECRET: string;
	GOOGLE_CALENDAR_ID: string;
};

export function redirectUriFor(url: URL): string {
	return new URL('/api/auth/google/callback', url.origin).toString();
}

export function buildAuthUrl(env: GoogleEnv, redirectUri: string, state: string): string {
	const params = new URLSearchParams({
		client_id: env.GOOGLE_CLIENT_ID,
		redirect_uri: redirectUri,
		response_type: 'code',
		scope: SCOPES.join(' '),
		// `offline` + `consent` guarantee a refresh token, including on re-consent.
		// `select_account` always shows Google's account picker: without it, a
		// browser signed in to several Google accounts silently uses the default
		// one, which may not be the admin account.
		access_type: 'offline',
		prompt: 'consent select_account',
		include_granted_scopes: 'true',
		state,
	});
	return AUTH_ENDPOINT + '?' + params.toString();
}

type TokenResponse = {
	access_token: string;
	expires_in: number;
	refresh_token?: string;
	id_token?: string;
};

async function postToken(body: URLSearchParams): Promise<TokenResponse> {
	const response = await fetch(TOKEN_ENDPOINT, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body,
	});
	if (!response.ok) {
		const detail = await response.text().catch(() => '');
		throw new Error('Google token endpoint ' + response.status + ': ' + detail.slice(0, 300));
	}
	return response.json();
}

export async function exchangeCode(
	env: GoogleEnv,
	code: string,
	redirectUri: string,
): Promise<TokenResponse> {
	return postToken(
		new URLSearchParams({
			code,
			client_id: env.GOOGLE_CLIENT_ID,
			client_secret: env.GOOGLE_CLIENT_SECRET,
			redirect_uri: redirectUri,
			grant_type: 'authorization_code',
		}),
	);
}

function decodeBase64Url(segment: string): string {
	const normalised = segment.replace(/-/g, '+').replace(/_/g, '/');
	const padded = normalised.padEnd(Math.ceil(normalised.length / 4) * 4, '=');
	const binary = atob(padded);
	const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
	return new TextDecoder().decode(bytes);
}

/**
 * Reads the verified email out of an ID token.
 *
 * The signature is not re-checked: this token came straight from Google's token
 * endpoint over TLS in a server-to-server call, which Google documents as
 * trustworthy without verification. Issuer, audience and expiry are still
 * checked, since those catch a misconfigured client.
 */
export function emailFromIdToken(idToken: string, expectedClientId: string): string | null {
	const parts = idToken.split('.');
	if (parts.length !== 3) return null;

	let payload: Record<string, unknown>;
	try {
		payload = JSON.parse(decodeBase64Url(parts[1]));
	} catch {
		return null;
	}

	const issuer = payload.iss;
	if (issuer !== 'https://accounts.google.com' && issuer !== 'accounts.google.com') return null;
	if (payload.aud !== expectedClientId) return null;
	if (typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now()) return null;
	if (payload.email_verified !== true) return null;
	if (typeof payload.email !== 'string') return null;

	return payload.email.toLowerCase();
}

export async function storeTokens(
	db: D1Database,
	email: string,
	tokens: { refreshToken?: string; accessToken: string; expiresIn: number },
): Promise<void> {
	const now = new Date();
	// Expire the cached token a minute early so a request never races the clock.
	const accessExpires = new Date(now.getTime() + (tokens.expiresIn - 60) * 1000).toISOString();

	if (tokens.refreshToken) {
		await db
			.prepare(
				`INSERT INTO oauth_tokens (email, refresh_token, access_token, access_token_expires_at, updated_at)
				 VALUES (?1, ?2, ?3, ?4, ?5)
				 ON CONFLICT(email) DO UPDATE SET
				   refresh_token = excluded.refresh_token,
				   access_token = excluded.access_token,
				   access_token_expires_at = excluded.access_token_expires_at,
				   updated_at = excluded.updated_at`,
			)
			.bind(email, tokens.refreshToken, tokens.accessToken, accessExpires, now.toISOString())
			.run();
		return;
	}

	// Google omits the refresh token on repeat consents; keep the stored one.
	await db
		.prepare(
			`UPDATE oauth_tokens
			 SET access_token = ?2, access_token_expires_at = ?3, updated_at = ?4
			 WHERE email = ?1`,
		)
		.bind(email, tokens.accessToken, accessExpires, now.toISOString())
		.run();
}

/**
 * Returns a usable access token for the owner, refreshing when the cached one
 * has expired. Throws `NOT_CONNECTED` when Google has never been linked.
 */
export async function getAccessToken(db: D1Database, env: GoogleEnv): Promise<string> {
	const row = await db
		.prepare(
			'SELECT email, refresh_token, access_token, access_token_expires_at FROM oauth_tokens LIMIT 1',
		)
		.first<{
			email: string;
			refresh_token: string;
			access_token: string | null;
			access_token_expires_at: string | null;
		}>();

	if (row === null) throw new Error('NOT_CONNECTED');

	if (
		row.access_token !== null &&
		row.access_token_expires_at !== null &&
		Date.parse(row.access_token_expires_at) > Date.now()
	) {
		return row.access_token;
	}

	const refreshed = await postToken(
		new URLSearchParams({
			client_id: env.GOOGLE_CLIENT_ID,
			client_secret: env.GOOGLE_CLIENT_SECRET,
			refresh_token: row.refresh_token,
			grant_type: 'refresh_token',
		}),
	);

	await storeTokens(db, row.email, {
		accessToken: refreshed.access_token,
		expiresIn: refreshed.expires_in,
	});
	return refreshed.access_token;
}

// ---------------------------------------------------------------------------
// Calendar
// ---------------------------------------------------------------------------

export type CalendarEvent = {
	id: string;
	summary?: string;
	description?: string;
	location?: string;
	start: { dateTime?: string; date?: string; timeZone?: string };
	end: { dateTime?: string; date?: string; timeZone?: string };
	attendees?: Array<{ email: string; responseStatus?: string }>;
	htmlLink?: string;
};

async function calendarFetch(
	accessToken: string,
	path: string,
	init: RequestInit = {},
): Promise<unknown> {
	const response = await fetch(CALENDAR_API + path, {
		...init,
		headers: {
			Authorization: 'Bearer ' + accessToken,
			'Content-Type': 'application/json',
			...(init.headers ?? {}),
		},
	});

	if (response.status === 204) return null;
	if (!response.ok) {
		const detail = await response.text().catch(() => '');
		throw new Error('Calendar API ' + response.status + ': ' + detail.slice(0, 300));
	}
	return response.json();
}

function calendarPath(env: GoogleEnv, suffix = ''): string {
	return '/calendars/' + encodeURIComponent(env.GOOGLE_CALENDAR_ID) + '/events' + suffix;
}

export async function listEvents(
	accessToken: string,
	env: GoogleEnv,
	range: { timeMin: string; timeMax: string },
): Promise<CalendarEvent[]> {
	const params = new URLSearchParams({
		timeMin: range.timeMin,
		timeMax: range.timeMax,
		// Expand recurring events so the admin view shows real occurrences.
		singleEvents: 'true',
		orderBy: 'startTime',
		maxResults: '250',
	});
	const data = (await calendarFetch(accessToken, calendarPath(env) + '?' + params.toString())) as {
		items?: CalendarEvent[];
	};
	return data.items ?? [];
}

export type EventInput = {
	summary: string;
	description?: string;
	location?: string;
	start: string;
	end: string;
	attendeeEmail?: string;
};

function toGoogleEvent(input: EventInput): Record<string, unknown> {
	// A bare YYYY-MM-DD means an all-day event; anything else is a timed one.
	const isAllDay = /^\d{4}-\d{2}-\d{2}$/.test(input.start);
	return {
		summary: input.summary,
		description: input.description,
		location: input.location,
		start: isAllDay ? { date: input.start } : { dateTime: new Date(input.start).toISOString() },
		end: isAllDay ? { date: input.end } : { dateTime: new Date(input.end).toISOString() },
		...(input.attendeeEmail ? { attendees: [{ email: input.attendeeEmail }] } : {}),
	};
}

export async function createEvent(
	accessToken: string,
	env: GoogleEnv,
	input: EventInput,
): Promise<CalendarEvent> {
	return (await calendarFetch(accessToken, calendarPath(env), {
		method: 'POST',
		body: JSON.stringify(toGoogleEvent(input)),
	})) as CalendarEvent;
}

export async function updateEvent(
	accessToken: string,
	env: GoogleEnv,
	eventId: string,
	input: EventInput,
): Promise<CalendarEvent> {
	return (await calendarFetch(accessToken, calendarPath(env, '/' + encodeURIComponent(eventId)), {
		method: 'PATCH',
		body: JSON.stringify(toGoogleEvent(input)),
	})) as CalendarEvent;
}

export async function deleteEvent(
	accessToken: string,
	env: GoogleEnv,
	eventId: string,
): Promise<void> {
	await calendarFetch(accessToken, calendarPath(env, '/' + encodeURIComponent(eventId)), {
		method: 'DELETE',
	});
}
