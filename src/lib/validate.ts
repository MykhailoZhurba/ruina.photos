/**
 * Validation for the public booking endpoint.
 *
 * This is the only unauthenticated write path on the site, so everything here is
 * deliberately strict: a fixed field list, hard length caps, and no value reaching
 * the database or an email template without passing through `clean()`.
 */

/** Upper bounds, chosen to be generous for humans and hostile to payload stuffing. */
const LIMITS = {
	email: 254, // RFC 5321 maximum
	name: 100,
	shootType: 60,
	preferredDate: 10, // YYYY-MM-DD
	message: 2000,
} as const;

export type BookingInput = {
	email: string;
	name: string | null;
	preferredDate: string | null;
	shootType: string | null;
	message: string | null;
};

/** Stable machine-readable reason; the popup maps it to a translated message. */
export type ValidationCode =
	| 'malformed'
	| 'rejected'
	| 'email_required'
	| 'email_invalid'
	| 'date_invalid';

export type ValidationResult =
	| { ok: true; value: BookingInput }
	| { ok: false; code: ValidationCode; error: string; field?: string };

const CONTROL_CHARS = /[\p{Cc}]/gu;

/**
 * Trim, drop control characters, and enforce a cap. Returns null for anything
 * empty once cleaned, so optional fields are stored as SQL NULL rather than ''.
 */
function clean(raw: unknown, max: number): string | null {
	if (typeof raw !== 'string') return null;
	const value = raw.replace(CONTROL_CHARS, ' ').replace(/\s+/g, ' ').trim();
	if (value.length === 0) return null;
	return value.slice(0, max);
}

/** Same as `clean`, but keeps newlines so a multi-line message survives intact. */
function cleanMultiline(raw: unknown, max: number): string | null {
	if (typeof raw !== 'string') return null;
	const value = raw
		.replace(/\r\n/g, '\n')
		.split('\n')
		.map((line) =>
			line
				.replace(CONTROL_CHARS, ' ')
				.replace(/[ \t]+/g, ' ')
				.trim(),
		)
		.join('\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
	if (value.length === 0) return null;
	return value.slice(0, max);
}

/**
 * Pragmatic email check. Deliberately not RFC-complete: the auto-reply is the
 * real proof of deliverability, so this only rejects what is obviously not an
 * address rather than turning away unusual but valid ones.
 */
function isPlausibleEmail(value: string): boolean {
	if (value.length > LIMITS.email) return false;
	if (/\s/.test(value)) return false;
	const at = value.indexOf('@');
	if (at < 1 || at !== value.lastIndexOf('@')) return false;
	const domain = value.slice(at + 1);
	if (domain.length < 3 || !domain.includes('.')) return false;
	if (domain.startsWith('.') || domain.endsWith('.') || domain.includes('..')) return false;
	if (domain.startsWith('-') || domain.endsWith('-')) return false;
	return true;
}

/** Accepts YYYY-MM-DD only, and only a real calendar date that has not passed. */
function normalizeDate(raw: string | null): { ok: true; value: string | null } | { ok: false } {
	if (raw === null) return { ok: true, value: null };
	if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return { ok: false };
	const parsed = new Date(`${raw}T00:00:00Z`);
	if (Number.isNaN(parsed.getTime())) return { ok: false };
	// Guard against rollover quietly turning 2026-02-31 into 2026-03-03.
	if (parsed.toISOString().slice(0, 10) !== raw) return { ok: false };
	// A day of slack so "today" is accepted from any timezone.
	if (parsed.getTime() < Date.now() - 36 * 60 * 60 * 1000) return { ok: false };
	return { ok: true, value: raw };
}

export function validateBooking(body: unknown, allowedShootTypes: string[]): ValidationResult {
	if (typeof body !== 'object' || body === null) {
		return { ok: false, code: 'malformed', error: 'Malformed request.' };
	}
	const input = body as Record<string, unknown>;

	// Honeypot: a hidden field no human ever sees. Bots that autofill every input
	// give themselves away here.
	if (clean(input.website, 100) !== null) {
		return { ok: false, code: 'rejected', error: 'Rejected.' };
	}

	const email = clean(input.email, LIMITS.email)?.toLowerCase() ?? null;
	if (email === null) {
		return {
			ok: false,
			code: 'email_required',
			error: 'Please enter your email address.',
			field: 'email',
		};
	}
	if (!isPlausibleEmail(email)) {
		return {
			ok: false,
			code: 'email_invalid',
			error: 'That email address does not look right.',
			field: 'email',
		};
	}

	const date = normalizeDate(clean(input.preferredDate, LIMITS.preferredDate));
	if (!date.ok) {
		return {
			ok: false,
			code: 'date_invalid',
			error: 'Please choose a date that has not already passed.',
			field: 'preferredDate',
		};
	}

	// An unrecognised shoot type means a tampered or stale form. Drop the value
	// rather than storing arbitrary text that later lands in an email.
	const shootTypeRaw = clean(input.shootType, LIMITS.shootType);
	const shootType =
		shootTypeRaw !== null && allowedShootTypes.includes(shootTypeRaw) ? shootTypeRaw : null;

	return {
		ok: true,
		value: {
			email,
			name: clean(input.name, LIMITS.name),
			preferredDate: date.value,
			shootType,
			message: cleanMultiline(input.message, LIMITS.message),
		},
	};
}
