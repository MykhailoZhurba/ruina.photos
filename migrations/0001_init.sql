-- ruina.photos booking system — initial schema
-- Apply:  npx wrangler d1 execute ruina-bookings --local  --file=./migrations/0001_init.sql
--         npx wrangler d1 execute ruina-bookings --remote --file=./migrations/0001_init.sql

-- Booking enquiries captured by the popup on the public site.
CREATE TABLE IF NOT EXISTS leads (
	id TEXT PRIMARY KEY,
	email TEXT NOT NULL,
	name TEXT,
	preferred_date TEXT,
	shoot_type TEXT,
	message TEXT,
	-- new | contacted | booked | archived
	status TEXT NOT NULL DEFAULT 'new',
	admin_notes TEXT,
	-- Set once the lead has been turned into a Google Calendar booking.
	calendar_event_id TEXT,
	-- Delivery outcome of the auto-reply, so a mail failure is visible in /admin
	-- instead of silently losing the lead.
	email_status TEXT NOT NULL DEFAULT 'pending',
	email_error TEXT,
	-- Salted hash only: enough to rate-limit, never the raw address.
	source_ip_hash TEXT,
	user_agent TEXT,
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_leads_created ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);

-- Admin sessions. Deleting a row revokes that session immediately.
CREATE TABLE IF NOT EXISTS sessions (
	id TEXT PRIMARY KEY,
	email TEXT NOT NULL,
	created_at TEXT NOT NULL,
	expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions (expires_at);

-- Google OAuth refresh token for the site owner, plus a cached access token.
-- Never leaves the Worker.
CREATE TABLE IF NOT EXISTS oauth_tokens (
	email TEXT PRIMARY KEY,
	refresh_token TEXT NOT NULL,
	access_token TEXT,
	access_token_expires_at TEXT,
	updated_at TEXT NOT NULL
);

-- Fixed-window rate limiting for the public booking endpoint.
CREATE TABLE IF NOT EXISTS rate_limits (
	key TEXT PRIMARY KEY,
	count INTEGER NOT NULL,
	window_start TEXT NOT NULL
);
