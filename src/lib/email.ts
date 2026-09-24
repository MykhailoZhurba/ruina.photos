/**
 * Transactional email via the Resend REST API.
 *
 * Called with `fetch` rather than the `resend` SDK: it is a single endpoint, and
 * keeping the dependency out keeps the Worker bundle small and free of any
 * runtime-compatibility risk.
 */

import type { LeadRow } from './db';
import { emailStrings, type EmailStrings } from '../i18n/email';
import { DEFAULT_LOCALE, LOCALE_META, type Locale } from '../i18n/locales';
import { shootTypeKey, useTranslations } from '../i18n/ui';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export type MailEnv = {
	RESEND_API_KEY: string;
	FROM_EMAIL: string;
	FROM_NAME: string;
	OWNER_EMAIL: string;
	SITE_URL: string;
};

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

type SendArgs = {
	to: string;
	subject: string;
	html: string;
	text: string;
	replyTo: string;
};

async function send(env: MailEnv, args: SendArgs): Promise<void> {
	const response = await fetch(RESEND_ENDPOINT, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${env.RESEND_API_KEY}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			from: `${env.FROM_NAME} <${env.FROM_EMAIL}>`,
			to: [args.to],
			reply_to: args.replyTo,
			subject: args.subject,
			html: args.html,
			text: args.text,
		}),
	});

	if (!response.ok) {
		const detail = await response.text().catch(() => '');
		throw new Error(`Resend ${response.status}: ${detail.slice(0, 300)}`);
	}
}

/** Wraps body content in the plain, serif shell used by both emails. */
function layout(bodyHtml: string, ownerName: string, locale: Locale = DEFAULT_LOCALE): string {
	return `<!doctype html>
<html lang="${locale}"><body style="margin:0;padding:24px;background:#f6f6f6;font-family:Georgia,'Times New Roman',serif;color:#111;">
<div style="max-width:560px;margin:0 auto;background:#fff;padding:32px;border:1px solid #e5e5e5;">
${bodyHtml}
<p style="margin:32px 0 0;padding-top:16px;border-top:1px solid #eee;font-size:13px;color:#777;">
${escapeHtml(ownerName)} &middot; ruina.photos
</p>
</div></body></html>`;
}

/**
 * The questions still worth asking, in the visitor's language. Anything they
 * already answered in the popup is left out, so nobody is asked to repeat
 * themselves.
 */
function outstandingQuestions(lead: LeadRow, s: EmailStrings): string[] {
	const questions: string[] = [];
	if (lead.preferred_date === null) questions.push(s.qDate);
	if (lead.shoot_type === null) questions.push(s.qType);
	questions.push(s.qPlace);
	questions.push(s.qPeople);
	if (lead.message === null) questions.push(s.qMood);
	return questions;
}

/**
 * What the visitor already told us, as "label: value" pairs. A list rather than
 * a sentence ("a portrait shoot"), because inflected languages cannot drop a
 * noun into a fixed sentence and stay grammatical.
 */
function knownDetails(lead: LeadRow, s: EmailStrings, locale: Locale): Array<[string, string]> {
	const { tOr } = useTranslations(locale);
	const known: Array<[string, string]> = [];
	if (lead.shoot_type !== null) {
		known.push([s.typeLabel, tOr(shootTypeKey(lead.shoot_type), lead.shoot_type)]);
	}
	if (lead.preferred_date !== null) known.push([s.dateLabel, lead.preferred_date]);
	return known;
}

export async function sendAutoReply(
	env: MailEnv,
	lead: LeadRow,
	ownerName: string,
	locale: Locale = DEFAULT_LOCALE,
): Promise<void> {
	const s = emailStrings[locale] ?? emailStrings[DEFAULT_LOCALE];
	// A replacer function, not a string: a name containing "$&" must not be
	// expanded by String.replace.
	const name = lead.name;
	const greeting = name === null ? s.hello : s.helloName.replace('{name}', () => name);
	const questions = outstandingQuestions(lead, s);
	const known = knownDetails(lead, s, locale);

	const knownHtml =
		known.length > 0
			? `<p style="margin:0 0 8px;">${escapeHtml(s.soFar)}</p>
<ul style="margin:0 0 16px;padding-left:20px;">
${known.map(([label, value]) => `<li style="margin-bottom:4px;">${escapeHtml(label)}: ${escapeHtml(value)}</li>`).join('\n')}
</ul>`
			: '';

	const html = layout(
		`<p style="margin:0 0 16px;">${escapeHtml(greeting)}</p>
<p style="margin:0 0 16px;">${escapeHtml(s.thanks)}</p>
${knownHtml}
<p style="margin:0 0 12px;">${escapeHtml(s.askIntro)}</p>
<ul style="margin:0 0 16px;padding-left:20px;">
${questions.map((q) => `<li style="margin-bottom:8px;">${escapeHtml(q)}</li>`).join('\n')}
</ul>
<p style="margin:0 0 16px;">${escapeHtml(s.reply)}</p>
<p style="margin:0;">${escapeHtml(s.signoff)}<br />${escapeHtml(ownerName)}</p>`,
		ownerName,
		locale,
	);

	const knownText =
		known.length > 0
			? `\n${s.soFar}\n${known.map(([label, value]) => `  - ${label}: ${value}`).join('\n')}\n`
			: '';

	const text = `${greeting}

${s.thanks}
${knownText}
${s.askIntro}

${questions.map((q) => `  - ${q}`).join('\n')}

${s.reply}

${s.signoff}
${ownerName}
ruina.photos`;

	await send(env, {
		to: lead.email,
		subject: s.subject,
		html,
		text,
		// Replies land in the owner's inbox, not in the no-reply sending address.
		replyTo: env.OWNER_EMAIL,
	});
}

export async function sendOwnerNotification(
	env: MailEnv,
	lead: LeadRow,
	locale: Locale = DEFAULT_LOCALE,
): Promise<void> {
	const fields: Array<[string, string]> = [
		['Email', lead.email],
		['Name', lead.name ?? '—'],
		['Preferred date', lead.preferred_date ?? '—'],
		['Shoot type', lead.shoot_type ?? '—'],
		['Message', lead.message ?? '—'],
		// The visitor's auto-reply went out in this language; reply in it too.
		['Language', `${LOCALE_META[locale].name} (${locale})`],
	];

	const rows = fields
		.map(
			([label, value]) =>
				`<tr>
<td style="padding:6px 12px 6px 0;vertical-align:top;color:#777;white-space:nowrap;">${escapeHtml(label)}</td>
<td style="padding:6px 0;vertical-align:top;white-space:pre-wrap;">${escapeHtml(value)}</td>
</tr>`,
		)
		.join('\n');

	const adminUrl = `${env.SITE_URL}/admin`;
	const html = layout(
		`<p style="margin:0 0 16px;font-size:18px;">New booking enquiry</p>
<table style="border-collapse:collapse;font-size:15px;">${rows}</table>
<p style="margin:24px 0 0;"><a href="${escapeHtml(adminUrl)}" style="color:#111;">Open the admin dashboard</a></p>`,
		'ruina.photos',
	);

	const text = `New booking enquiry

${fields.map(([label, value]) => `${label}: ${value}`).join('\n')}

${adminUrl}`;

	await send(env, {
		to: env.OWNER_EMAIL,
		subject: `New booking enquiry — ${lead.email}`,
		html,
		text,
		// Lets the owner reply straight to the visitor from their inbox.
		replyTo: lead.email,
	});
}
