import { afterEach, describe, expect, it, vi } from 'vitest';
import type { LeadRow } from './db';
import { sendAutoReply, sendOwnerNotification, type MailEnv } from './email';

const env: MailEnv = {
	RESEND_API_KEY: 'test-key',
	FROM_EMAIL: 'bookings@ruina.photos',
	FROM_NAME: 'Ruina Photos',
	OWNER_EMAIL: 'owner@example.com',
	SITE_URL: 'https://ruina.photos',
};

const lead = (overrides: Partial<LeadRow> = {}): LeadRow => ({
	id: 'lead-1',
	email: 'visitor@example.com',
	name: null,
	preferred_date: null,
	shoot_type: null,
	message: null,
	status: 'new',
	admin_notes: null,
	calendar_event_id: null,
	email_status: 'pending',
	email_error: null,
	created_at: '2026-09-24T10:00:00.000Z',
	updated_at: '2026-09-24T10:00:00.000Z',
	...overrides,
});

/** Captures what would be POSTed to Resend instead of sending it. */
function captureSend() {
	const sent: Array<{ to: string[]; subject: string; html: string; text: string }> = [];
	vi.stubGlobal(
		'fetch',
		vi.fn(async (_url: string, init: RequestInit) => {
			sent.push(JSON.parse(String(init.body)));
			return new Response('{}', { status: 200 });
		}),
	);
	return sent;
}

afterEach(() => vi.unstubAllGlobals());

describe('visitor auto-reply', () => {
	it('is written in the language the visitor booked in', async () => {
		const sent = captureSend();
		await sendAutoReply(env, lead({ shoot_type: 'Wedding' }), 'Mykhailo Zhurba', 'uk');
		const [mail] = sent;
		expect(mail.subject).toBe('Про вашу зйомку — кілька деталей');
		expect(mail.text).toContain('Вітаю!');
		expect(mail.html).toContain('<html lang="uk">');
	});

	it('shows the shoot type translated, and falls back to the stored value', async () => {
		const sent = captureSend();
		await sendAutoReply(
			env,
			lead({ shoot_type: 'Automotive', preferred_date: '2026-11-20' }),
			'Mykhailo Zhurba',
			'lv',
		);
		expect(sent[0].text).toContain('Fotosesijas veids: Auto');
		expect(sent[0].text).toContain('Vēlamais datums: 2026-11-20');

		// A shoot type with no translation (e.g. from an older form) is shown as stored.
		await sendAutoReply(env, lead({ shoot_type: 'Underwater' }), 'Mykhailo Zhurba', 'lv');
		expect(sent[1].text).toContain('Fotosesijas veids: Underwater');
	});

	it('only asks about what the visitor has not already said', async () => {
		const sent = captureSend();
		await sendAutoReply(
			env,
			lead({ shoot_type: 'Portrait', preferred_date: '2026-11-20', message: 'Studio' }),
			'Mykhailo Zhurba',
			'en',
		);
		expect(sent[0].text).not.toContain('What date');
		expect(sent[0].text).not.toContain('What kind of shoot');
		expect(sent[0].text).toContain('How many people');
	});

	it('inserts the name literally, even one that looks like a replace pattern', async () => {
		const sent = captureSend();
		await sendAutoReply(env, lead({ name: 'A$&B' }), 'Mykhailo Zhurba', 'ru');
		expect(sent[0].text.startsWith('Здравствуйте, A$&B!')).toBe(true);
	});

	it('escapes the name in the HTML version', async () => {
		const sent = captureSend();
		await sendAutoReply(env, lead({ name: '<b>x</b>' }), 'Mykhailo Zhurba', 'en');
		expect(sent[0].html).toContain('Hi &lt;b&gt;x&lt;/b&gt;,');
		expect(sent[0].html).not.toContain('<b>x</b>');
	});
});

describe('owner notification', () => {
	it('stays in English and names the visitor language', async () => {
		const sent = captureSend();
		await sendOwnerNotification(env, lead(), 'ru');
		expect(sent[0].subject).toBe('New booking enquiry — visitor@example.com');
		expect(sent[0].text).toContain('Language: Русский (ru)');
		expect(sent[0].to).toEqual(['owner@example.com']);
	});
});
