/**
 * D1 access for the booking system. Every statement is parameterised; no caller
 * ever interpolates a value into SQL.
 */

import type { BookingInput } from './validate';

export type LeadRow = {
	id: string;
	email: string;
	name: string | null;
	preferred_date: string | null;
	shoot_type: string | null;
	message: string | null;
	status: string;
	admin_notes: string | null;
	calendar_event_id: string | null;
	email_status: string;
	email_error: string | null;
	created_at: string;
	updated_at: string;
};

export const LEAD_STATUSES = ['new', 'contacted', 'booked', 'archived'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export function isLeadStatus(value: unknown): value is LeadStatus {
	return typeof value === 'string' && (LEAD_STATUSES as readonly string[]).includes(value);
}

/**
 * Salted SHA-256 of a client IP. Enough to rate-limit a repeat sender without
 * ever storing the address itself.
 */
export async function hashIp(ip: string, secret: string): Promise<string> {
	const data = new TextEncoder().encode(`${secret}:${ip}`);
	const digest = await crypto.subtle.digest('SHA-256', data);
	return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export type RateLimitVerdict = { allowed: boolean; retryAfterSeconds: number };

/**
 * Fixed-window rate limit, applied as a single atomic upsert so two concurrent
 * requests cannot both read a stale count and both be let through.
 */
export async function checkRateLimit(
	db: D1Database,
	key: string,
	limit: number,
	windowSeconds: number,
): Promise<RateLimitVerdict> {
	const now = new Date().toISOString();
	const row = await db
		.prepare(
			`INSERT INTO rate_limits (key, count, window_start)
			 VALUES (?1, 1, ?2)
			 ON CONFLICT(key) DO UPDATE SET
			   count = CASE
			     WHEN strftime('%s', ?2) - strftime('%s', rate_limits.window_start) >= ?3 THEN 1
			     ELSE rate_limits.count + 1 END,
			   window_start = CASE
			     WHEN strftime('%s', ?2) - strftime('%s', rate_limits.window_start) >= ?3 THEN ?2
			     ELSE rate_limits.window_start END
			 RETURNING count, window_start`,
		)
		.bind(key, now, windowSeconds)
		.first<{ count: number; window_start: string }>();

	if (row === null) return { allowed: true, retryAfterSeconds: 0 };

	if (row.count > limit) {
		const elapsed = (Date.parse(now) - Date.parse(row.window_start)) / 1000;
		return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil(windowSeconds - elapsed)) };
	}
	return { allowed: true, retryAfterSeconds: 0 };
}

export async function insertLead(
	db: D1Database,
	input: BookingInput,
	meta: { ipHash: string | null; userAgent: string | null },
): Promise<LeadRow> {
	const id = crypto.randomUUID();
	const now = new Date().toISOString();
	await db
		.prepare(
			`INSERT INTO leads
			   (id, email, name, preferred_date, shoot_type, message,
			    status, email_status, source_ip_hash, user_agent, created_at, updated_at)
			 VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'new', 'pending', ?7, ?8, ?9, ?9)`,
		)
		.bind(
			id,
			input.email,
			input.name,
			input.preferredDate,
			input.shootType,
			input.message,
			meta.ipHash,
			meta.userAgent,
			now,
		)
		.run();

	return {
		id,
		email: input.email,
		name: input.name,
		preferred_date: input.preferredDate,
		shoot_type: input.shootType,
		message: input.message,
		status: 'new',
		admin_notes: null,
		calendar_event_id: null,
		email_status: 'pending',
		email_error: null,
		created_at: now,
		updated_at: now,
	};
}

/**
 * Records how the auto-reply fared. A send failure is stored against the lead
 * rather than thrown away, so /admin can show which enquiries need chasing by
 * hand.
 */
export async function setLeadEmailStatus(
	db: D1Database,
	id: string,
	status: 'sent' | 'failed' | 'partial',
	error: string | null,
): Promise<void> {
	await db
		.prepare(`UPDATE leads SET email_status = ?2, email_error = ?3, updated_at = ?4 WHERE id = ?1`)
		.bind(id, status, error?.slice(0, 500) ?? null, new Date().toISOString())
		.run();
}

export async function listLeads(
	db: D1Database,
	opts: { limit: number; offset: number; status?: LeadStatus },
): Promise<{ leads: LeadRow[]; total: number }> {
	const where = opts.status ? 'WHERE status = ?3' : '';
	const binds: unknown[] = [opts.limit, opts.offset];
	if (opts.status) binds.push(opts.status);

	const [rows, count] = await db.batch<LeadRow | { total: number }>([
		db
			.prepare(`SELECT * FROM leads ${where} ORDER BY created_at DESC LIMIT ?1 OFFSET ?2`)
			.bind(...binds),
		opts.status
			? db.prepare('SELECT COUNT(*) AS total FROM leads WHERE status = ?1').bind(opts.status)
			: db.prepare('SELECT COUNT(*) AS total FROM leads'),
	]);

	return {
		leads: (rows.results ?? []) as LeadRow[],
		total: ((count.results?.[0] as { total: number } | undefined)?.total ?? 0) as number,
	};
}

export async function updateLead(
	db: D1Database,
	id: string,
	patch: { status?: LeadStatus; adminNotes?: string | null; calendarEventId?: string | null },
): Promise<LeadRow | null> {
	const sets: string[] = [];
	const binds: unknown[] = [];

	if (patch.status !== undefined) {
		binds.push(patch.status);
		sets.push(`status = ?${binds.length}`);
	}
	if (patch.adminNotes !== undefined) {
		binds.push(patch.adminNotes?.slice(0, 4000) ?? null);
		sets.push(`admin_notes = ?${binds.length}`);
	}
	if (patch.calendarEventId !== undefined) {
		binds.push(patch.calendarEventId);
		sets.push(`calendar_event_id = ?${binds.length}`);
	}
	if (sets.length === 0) return getLead(db, id);

	binds.push(new Date().toISOString());
	sets.push(`updated_at = ?${binds.length}`);
	binds.push(id);

	return db
		.prepare(`UPDATE leads SET ${sets.join(', ')} WHERE id = ?${binds.length} RETURNING *`)
		.bind(...binds)
		.first<LeadRow>();
}

export async function getLead(db: D1Database, id: string): Promise<LeadRow | null> {
	return db.prepare('SELECT * FROM leads WHERE id = ?1').bind(id).first<LeadRow>();
}

export async function deleteLead(db: D1Database, id: string): Promise<boolean> {
	const result = await db.prepare('DELETE FROM leads WHERE id = ?1').bind(id).run();
	return (result.meta.changes ?? 0) > 0;
}
