/**
 * Transactional email via the Resend REST API.
 *
 * Called with `fetch` rather than the `resend` SDK: it is a single endpoint, and
 * keeping the dependency out keeps the Worker bundle small and free of any
 * runtime-compatibility risk.
 */

import type { LeadRow } from './db';

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
function layout(bodyHtml: string, ownerName: string): string {
	return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f6f6f6;font-family:Georgia,'Times New Roman',serif;color:#111;">
<div style="max-width:560px;margin:0 auto;background:#fff;padding:32px;border:1px solid #e5e5e5;">
${bodyHtml}
<p style="margin:32px 0 0;padding-top:16px;border-top:1px solid #eee;font-size:13px;color:#777;">
${escapeHtml(ownerName)} &middot; ruina.photos
</p>
</div></body></html>`;
}

/**
 * The questions still worth asking. Anything the visitor already answered in the
 * popup is left out, so nobody is asked to repeat themselves.
 */
function outstandingQuestions(lead: LeadRow): string[] {
	const questions: string[] = [];
	if (lead.preferred_date === null)
		questions.push('What date (or rough window) do you have in mind?');
	if (lead.shoot_type === null) questions.push('What kind of shoot is it?');
	questions.push('Where would you like to shoot, and roughly how long do you need?');
	questions.push('How many people will be in front of the camera?');
	if (lead.message === null) questions.push('Anything else about the look or mood you are after?');
	return questions;
}

export async function sendAutoReply(env: MailEnv, lead: LeadRow, ownerName: string): Promise<void> {
	const greeting = lead.name === null ? 'Hello,' : `Hi ${escapeHtml(lead.name)},`;
	const questions = outstandingQuestions(lead);

	const known: string[] = [];
	if (lead.shoot_type !== null) known.push(`a ${lead.shoot_type.toLowerCase()} shoot`);
	if (lead.preferred_date !== null) known.push(`around ${lead.preferred_date}`);
	const knownLine =
		known.length > 0
			? `<p style="margin:0 0 16px;">I have you down for ${escapeHtml(known.join(', '))}.</p>`
			: '';

	const html = layout(
		`<p style="margin:0 0 16px;">${greeting}</p>
<p style="margin:0 0 16px;">Thank you for getting in touch about a shoot — I am glad you did.</p>
${knownLine}
<p style="margin:0 0 12px;">To put together the right plan and a price, it would help to know:</p>
<ul style="margin:0 0 16px;padding-left:20px;">
${questions.map((q) => `<li style="margin-bottom:8px;">${escapeHtml(q)}</li>`).join('\n')}
</ul>
<p style="margin:0 0 16px;">Just reply to this email — no forms. I usually answer within a day or two.</p>
<p style="margin:0;">Looking forward to hearing more,<br />${escapeHtml(ownerName)}</p>`,
		ownerName,
	);

	const text = `${lead.name === null ? 'Hello,' : `Hi ${lead.name},`}

Thank you for getting in touch about a shoot - I am glad you did.
${known.length > 0 ? `\nI have you down for ${known.join(', ')}.\n` : ''}
To put together the right plan and a price, it would help to know:

${questions.map((q) => `  - ${q}`).join('\n')}

Just reply to this email - no forms. I usually answer within a day or two.

Looking forward to hearing more,
${ownerName}
ruina.photos`;

	await send(env, {
		to: lead.email,
		subject: 'About your shoot — a few details',
		html,
		text,
		// Replies land in the owner's inbox, not in the no-reply sending address.
		replyTo: env.OWNER_EMAIL,
	});
}

export async function sendOwnerNotification(env: MailEnv, lead: LeadRow): Promise<void> {
	const fields: Array<[string, string]> = [
		['Email', lead.email],
		['Name', lead.name ?? '—'],
		['Preferred date', lead.preferred_date ?? '—'],
		['Shoot type', lead.shoot_type ?? '—'],
		['Message', lead.message ?? '—'],
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
