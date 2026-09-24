/**
 * Public booking endpoint.
 *
 * Ordering matters here: the lead is written to D1 *before* any mail is
 * attempted, so a Resend outage degrades to "we have the enquiry but the
 * auto-reply did not go out" rather than losing the enquiry outright. The
 * failure is recorded on the row and surfaced in /admin.
 */

import type { APIRoute } from 'astro';
import siteConfig from '../../../site.config.mjs';
import { validateBooking } from '../../lib/validate';
import { checkRateLimit, hashIp, insertLead, setLeadEmailStatus } from '../../lib/db';
import { sendAutoReply, sendOwnerNotification } from '../../lib/email';
import { DEFAULT_LOCALE, isLocale } from '../../i18n/locales';

export const prerender = false;

/** Per-IP window. Generous for a human, tight enough to make scripted abuse dull. */
const RATE_LIMIT = { max: 5, windowSeconds: 900 };

/** Anything larger than this is not a booking enquiry. */
const MAX_BODY_BYTES = 8 * 1024;

function json(body: unknown, status: number, headers: Record<string, string> = {}): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers },
	});
}

// Every response carries a stable `code`; the popup shows the translated text for
// it and only falls back to these English strings for a code it does not know.
const SUCCESS = {
	ok: true,
	code: 'sent',
	message: 'Thank you — check your inbox, I have sent you a note.',
};

export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
	const env = locals.runtime.env;

	if (!request.headers.get('content-type')?.includes('application/json')) {
		return json({ ok: false, code: 'malformed', error: 'Expected JSON.' }, 415);
	}

	const declaredLength = Number(request.headers.get('content-length') ?? '0');
	if (declaredLength > MAX_BODY_BYTES) {
		return json({ ok: false, code: 'too_long', error: 'That message is too long.' }, 413);
	}

	let body: unknown;
	try {
		const raw = await request.text();
		if (raw.length > MAX_BODY_BYTES) {
			return json({ ok: false, code: 'too_long', error: 'That message is too long.' }, 413);
		}
		body = JSON.parse(raw);
	} catch {
		return json({ ok: false, code: 'malformed', error: 'Malformed request.' }, 400);
	}

	const result = validateBooking(body, siteConfig.shootTypes);
	if (!result.ok) {
		// The honeypot path answers exactly like a success so a bot gets no signal
		// that it was caught. Nothing is stored and nothing is sent.
		if (result.code === 'rejected') return json(SUCCESS, 200);
		return json({ ok: false, code: result.code, error: result.error, field: result.field }, 400);
	}

	// The language of the page the visitor booked from; their auto-reply uses it.
	const rawLocale = (body as Record<string, unknown>).locale;
	const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

	const ip = request.headers.get('cf-connecting-ip') ?? clientAddress ?? 'unknown';
	const ipHash = await hashIp(ip, env.SESSION_SECRET);

	let verdict;
	try {
		verdict = await checkRateLimit(
			env.DB,
			`booking:${ipHash}`,
			RATE_LIMIT.max,
			RATE_LIMIT.windowSeconds,
		);
	} catch (error) {
		// Same answer as a failed insert: a JSON error the popup can translate,
		// not an unhandled exception that returns an HTML error page.
		console.error('booking: rate-limit check failed', error);
		return json(
			{
				ok: false,
				code: 'server_error',
				error: 'Something went wrong on my end. Please try again.',
			},
			500,
		);
	}
	if (!verdict.allowed) {
		return json(
			{
				ok: false,
				code: 'rate_limited',
				error: 'That is a few enquiries in a row — please try again shortly.',
			},
			429,
			{ 'Retry-After': String(verdict.retryAfterSeconds) },
		);
	}

	let lead;
	try {
		lead = await insertLead(env.DB, result.value, {
			ipHash,
			userAgent: request.headers.get('user-agent')?.slice(0, 300) ?? null,
		});
	} catch (error) {
		console.error('booking: failed to store lead', error);
		return json(
			{
				ok: false,
				code: 'server_error',
				error: 'Something went wrong on my end. Please try again.',
			},
			500,
		);
	}

	// The enquiry is safely stored from here on; mail problems are reported to the
	// owner through the lead row, never by failing the visitor's submission.
	const [autoReply, notification] = await Promise.allSettled([
		sendAutoReply(env, lead, siteConfig.owner, locale),
		sendOwnerNotification(env, lead, locale),
	]);

	const failures = [autoReply, notification]
		.filter((r): r is PromiseRejectedResult => r.status === 'rejected')
		.map((r) => (r.reason instanceof Error ? r.reason.message : String(r.reason)));

	if (failures.length > 0) {
		console.error('booking: email delivery problem', failures);
		await setLeadEmailStatus(
			env.DB,
			lead.id,
			failures.length === 2 ? 'failed' : 'partial',
			failures.join(' | '),
		).catch(() => undefined);
	} else {
		await setLeadEmailStatus(env.DB, lead.id, 'sent', null).catch(() => undefined);
	}

	// The visitor is told the truth about what they should expect to see.
	if (autoReply.status === 'rejected') {
		return json(
			{
				ok: true,
				code: 'stored',
				message: 'Thank you — I have your enquiry and will be in touch by email shortly.',
			},
			200,
		);
	}
	return json(SUCCESS, 200);
};

/** Astro routes POST above; everything else lands here. */
export const ALL: APIRoute = () =>
	json({ ok: false, code: 'method', error: 'Method not allowed.' }, 405, { Allow: 'POST' });
