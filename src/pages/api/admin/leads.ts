/**
 * Booking enquiries, for the admin dashboard only.
 *
 * Every method is behind the session guard: these rows hold visitors' email
 * addresses and must never be readable without one.
 */

import type { APIRoute } from 'astro';
import { deleteLead, isLeadStatus, listLeads, updateLead } from '../../../lib/db';
import { currentAdmin, isSameOrigin } from '../../../lib/session';

export const prerender = false;

const MAX_PAGE_SIZE = 200;

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

const UNAUTHORISED = () => json({ ok: false, error: 'Not signed in.' }, 401);

export const GET: APIRoute = async ({ url, cookies, locals }) => {
	const env = locals.runtime.env;
	const admin = await currentAdmin(env.DB, cookies, url);
	if (admin === null) return UNAUTHORISED();

	const limit = Math.min(
		Math.max(Number(url.searchParams.get('limit') ?? '100') || 100, 1),
		MAX_PAGE_SIZE,
	);
	const offset = Math.max(Number(url.searchParams.get('offset') ?? '0') || 0, 0);
	const statusParam = url.searchParams.get('status');
	const status = isLeadStatus(statusParam) ? statusParam : undefined;

	try {
		const { leads, total } = await listLeads(env.DB, { limit, offset, status });
		return json({ ok: true, leads, total, limit, offset });
	} catch (cause) {
		console.error('admin/leads: list failed', cause);
		return json({ ok: false, error: 'Could not load enquiries.' }, 500);
	}
};

export const PATCH: APIRoute = async ({ request, url, cookies, locals }) => {
	const env = locals.runtime.env;
	const admin = await currentAdmin(env.DB, cookies, url);
	if (admin === null) return UNAUTHORISED();
	if (!isSameOrigin(request, url)) return json({ ok: false, error: 'Rejected.' }, 403);

	let body: Record<string, unknown>;
	try {
		body = await request.json();
	} catch {
		return json({ ok: false, error: 'Malformed request.' }, 400);
	}

	const id = typeof body.id === 'string' ? body.id : null;
	if (id === null) return json({ ok: false, error: 'Missing enquiry id.' }, 400);

	if (body.status !== undefined && !isLeadStatus(body.status)) {
		return json({ ok: false, error: 'Unknown status.' }, 400);
	}

	try {
		const lead = await updateLead(env.DB, id, {
			status: isLeadStatus(body.status) ? body.status : undefined,
			adminNotes:
				body.adminNotes === undefined
					? undefined
					: typeof body.adminNotes === 'string' && body.adminNotes.trim() !== ''
						? body.adminNotes
						: null,
			calendarEventId:
				body.calendarEventId === undefined
					? undefined
					: typeof body.calendarEventId === 'string'
						? body.calendarEventId
						: null,
		});
		if (lead === null) return json({ ok: false, error: 'No such enquiry.' }, 404);
		return json({ ok: true, lead });
	} catch (cause) {
		console.error('admin/leads: update failed', cause);
		return json({ ok: false, error: 'Could not save the change.' }, 500);
	}
};

export const DELETE: APIRoute = async ({ request, url, cookies, locals }) => {
	const env = locals.runtime.env;
	const admin = await currentAdmin(env.DB, cookies, url);
	if (admin === null) return UNAUTHORISED();
	if (!isSameOrigin(request, url)) return json({ ok: false, error: 'Rejected.' }, 403);

	const id = url.searchParams.get('id');
	if (id === null) return json({ ok: false, error: 'Missing enquiry id.' }, 400);

	try {
		const removed = await deleteLead(env.DB, id);
		if (!removed) return json({ ok: false, error: 'No such enquiry.' }, 404);
		return json({ ok: true });
	} catch (cause) {
		console.error('admin/leads: delete failed', cause);
		return json({ ok: false, error: 'Could not delete the enquiry.' }, 500);
	}
};
