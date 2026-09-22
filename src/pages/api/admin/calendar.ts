/**
 * Google Calendar proxy for the admin dashboard.
 *
 * The browser never holds a Google token: it calls this endpoint, which is
 * session-guarded and attaches the owner's access token server-side.
 */

import type { APIRoute } from 'astro';
import {
	createEvent,
	deleteEvent,
	getAccessToken,
	listEvents,
	updateEvent,
	type EventInput,
} from '../../../lib/google';
import { updateLead } from '../../../lib/db';
import { currentAdmin, isSameOrigin } from '../../../lib/session';

export const prerender = false;

function json(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'no-store',
			'X-Robots-Tag': 'noindex, nofollow',
		},
	});
}

/**
 * `NOT_CONNECTED` means there is no stored refresh token — the owner has a
 * session but has never completed Google consent (or it was revoked). That is a
 * "reconnect" prompt, not a server error.
 */
function googleFailure(cause: unknown): Response {
	const detail = cause instanceof Error ? cause.message : String(cause);
	if (detail === 'NOT_CONNECTED') {
		return json({ ok: false, error: 'Google Calendar is not connected.', reconnect: true }, 409);
	}
	console.error('admin/calendar: google call failed', detail);
	if (detail.includes('401') || detail.includes('invalid_grant')) {
		return json(
			{ ok: false, error: 'Google access expired. Please sign in again.', reconnect: true },
			409,
		);
	}
	return json({ ok: false, error: 'Google Calendar request failed.' }, 502);
}

function readEventInput(body: Record<string, unknown>): EventInput | string {
	const summary = typeof body.summary === 'string' ? body.summary.trim() : '';
	const start = typeof body.start === 'string' ? body.start.trim() : '';
	const end = typeof body.end === 'string' ? body.end.trim() : '';

	if (summary === '') return 'Give the booking a title.';
	if (start === '' || end === '') return 'A booking needs a start and an end.';

	const isAllDay = /^\d{4}-\d{2}-\d{2}$/.test(start);
	if (!isAllDay && Number.isNaN(Date.parse(start))) return 'That start time is not valid.';
	if (!isAllDay && Number.isNaN(Date.parse(end))) return 'That end time is not valid.';
	if (!isAllDay && Date.parse(end) <= Date.parse(start)) {
		return 'The booking has to end after it starts.';
	}

	return {
		summary: summary.slice(0, 300),
		description: typeof body.description === 'string' ? body.description.slice(0, 4000) : undefined,
		location: typeof body.location === 'string' ? body.location.slice(0, 300) : undefined,
		start,
		end,
		attendeeEmail: typeof body.attendeeEmail === 'string' ? body.attendeeEmail : undefined,
	};
}

export const GET: APIRoute = async ({ url, cookies, locals }) => {
	const env = locals.runtime.env;
	const admin = await currentAdmin(env.DB, cookies, url);
	if (admin === null) return json({ ok: false, error: 'Not signed in.' }, 401);

	// Default to a window around today so the dashboard has something to show.
	const now = new Date();
	const defaultMin = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
	const defaultMax = new Date(now.getFullYear(), now.getMonth() + 3, 0).toISOString();

	const timeMin = url.searchParams.get('timeMin') ?? defaultMin;
	const timeMax = url.searchParams.get('timeMax') ?? defaultMax;
	if (Number.isNaN(Date.parse(timeMin)) || Number.isNaN(Date.parse(timeMax))) {
		return json({ ok: false, error: 'Invalid date range.' }, 400);
	}

	try {
		const accessToken = await getAccessToken(env.DB, env);
		const events = await listEvents(accessToken, env, { timeMin, timeMax });
		return json({ ok: true, events, calendarId: env.GOOGLE_CALENDAR_ID });
	} catch (cause) {
		return googleFailure(cause);
	}
};

export const POST: APIRoute = async ({ request, url, cookies, locals }) => {
	const env = locals.runtime.env;
	const admin = await currentAdmin(env.DB, cookies, url);
	if (admin === null) return json({ ok: false, error: 'Not signed in.' }, 401);
	if (!isSameOrigin(request, url)) return json({ ok: false, error: 'Rejected.' }, 403);

	let body: Record<string, unknown>;
	try {
		body = await request.json();
	} catch {
		return json({ ok: false, error: 'Malformed request.' }, 400);
	}

	const input = readEventInput(body);
	if (typeof input === 'string') return json({ ok: false, error: input }, 400);

	try {
		const accessToken = await getAccessToken(env.DB, env);
		const event = await createEvent(accessToken, env, input);

		// When the booking came from an enquiry, link the two so the leads table
		// shows which enquiries are now on the calendar.
		const leadId = typeof body.leadId === 'string' ? body.leadId : null;
		if (leadId !== null) {
			await updateLead(env.DB, leadId, { status: 'booked', calendarEventId: event.id }).catch(
				(cause) => console.error('admin/calendar: could not link lead', cause),
			);
		}

		return json({ ok: true, event });
	} catch (cause) {
		return googleFailure(cause);
	}
};

export const PATCH: APIRoute = async ({ request, url, cookies, locals }) => {
	const env = locals.runtime.env;
	const admin = await currentAdmin(env.DB, cookies, url);
	if (admin === null) return json({ ok: false, error: 'Not signed in.' }, 401);
	if (!isSameOrigin(request, url)) return json({ ok: false, error: 'Rejected.' }, 403);

	let body: Record<string, unknown>;
	try {
		body = await request.json();
	} catch {
		return json({ ok: false, error: 'Malformed request.' }, 400);
	}

	const eventId = typeof body.eventId === 'string' ? body.eventId : null;
	if (eventId === null) return json({ ok: false, error: 'Missing event id.' }, 400);

	const input = readEventInput(body);
	if (typeof input === 'string') return json({ ok: false, error: input }, 400);

	try {
		const accessToken = await getAccessToken(env.DB, env);
		const event = await updateEvent(accessToken, env, eventId, input);
		return json({ ok: true, event });
	} catch (cause) {
		return googleFailure(cause);
	}
};

export const DELETE: APIRoute = async ({ request, url, cookies, locals }) => {
	const env = locals.runtime.env;
	const admin = await currentAdmin(env.DB, cookies, url);
	if (admin === null) return json({ ok: false, error: 'Not signed in.' }, 401);
	if (!isSameOrigin(request, url)) return json({ ok: false, error: 'Rejected.' }, 403);

	const eventId = url.searchParams.get('eventId');
	if (eventId === null) return json({ ok: false, error: 'Missing event id.' }, 400);

	try {
		const accessToken = await getAccessToken(env.DB, env);
		await deleteEvent(accessToken, env, eventId);
		return json({ ok: true });
	} catch (cause) {
		return googleFailure(cause);
	}
};
