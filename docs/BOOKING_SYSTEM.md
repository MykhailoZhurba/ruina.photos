# Booking system — setup and runbook

The site captures booking enquiries through a popup, emails the visitor for the
details, and gives the owner an admin dashboard with a read/write Google
Calendar. This document is everything needed to set it up, run it locally and
deploy it.

---

## 1. What is where

| Piece                             | File                                                                                |
| --------------------------------- | ----------------------------------------------------------------------------------- |
| Popup (markup + Alpine behaviour) | `src/components/BookingModal.astro`                                                 |
| "Book" buttons in the nav         | `src/components/NavBar.astro`                                                       |
| Popup mounted site-wide           | `src/layouts/MainLayout.astro`                                                      |
| Public booking endpoint           | `src/pages/api/booking.ts`                                                          |
| Input validation                  | `src/lib/validate.ts`                                                               |
| Database access                   | `src/lib/db.ts`                                                                     |
| Email templates and sending       | `src/lib/email.ts`                                                                  |
| Sessions and admin allowlist      | `src/lib/session.ts`                                                                |
| Google OAuth + Calendar client    | `src/lib/google.ts`                                                                 |
| Sign in / out                     | `src/pages/api/auth/google/start.ts`, `callback.ts`, `src/pages/api/auth/logout.ts` |
| Admin dashboard                   | `src/pages/admin/index.astro`, `src/layouts/AdminLayout.astro`                      |
| Admin APIs                        | `src/pages/api/admin/leads.ts`, `calendar.ts`                                       |
| Schema                            | `migrations/0001_init.sql`                                                          |
| Worker + bindings                 | `wrangler.jsonc`                                                                    |

The gallery, About and collections pages are still prerendered static HTML. Only
`/admin` and `/api/*` run on the Worker, via `export const prerender = false`.

### Request flow

```
Visitor → "Book" → popup → POST /api/booking
                              ├─ validate, honeypot, rate limit
                              ├─ INSERT into D1 `leads`          ← happens first
                              └─ Resend: auto-reply + owner notice

Owner  → /admin → session cookie checked against D1 `sessions`
                   ├─ no session → /api/auth/google/start → Google → callback
                   ├─ /api/admin/leads     list / update / delete
                   └─ /api/admin/calendar  Google Calendar, proxied server-side
```

The lead is written **before** any email is attempted, so a mail outage never
loses an enquiry. Failures are recorded on the row (`email_status`,
`email_error`) and flagged in the dashboard.

---

## 2. One-time setup

### 2.1 Cloudflare

```bash
npx wrangler login
```

```bash
npx wrangler d1 create ruina-bookings
```

Copy the printed `database_id` into `wrangler.jsonc`, replacing
`PLACEHOLDER_RUN_WRANGLER_D1_CREATE`.

Apply the schema to both the local and the remote database:

```bash
npm run db:migrate:local
```

```bash
npm run db:migrate:remote
```

### 2.2 Resend (email)

1. Create an account at [resend.com](https://resend.com).
2. **Add and verify the domain `ruina.photos`.** Resend shows the exact DNS
   records to add (an MX and TXT pair on a `send.` subdomain, plus a DKIM TXT
   record). Until the domain is verified, Resend will only deliver to your own
   account address — fine for testing, not for real visitors.
3. Create an API key and keep it for the next step.

`FROM_EMAIL` in `wrangler.jsonc` must be on the verified domain
(`bookings@ruina.photos`). `OWNER_EMAIL` is where notifications and visitor
replies go and can be any address.

### 2.3 Google (admin sign-in + Calendar)

1. In the [Google Cloud console](https://console.cloud.google.com), create a
   project.
2. **Enable the Google Calendar API** for it.
3. Configure the OAuth consent screen (External). Add your own Google account as
   a test user, or publish the app.
4. Create credentials → **OAuth client ID** → **Web application**.
5. Add these authorised redirect URIs:
   - `https://ruina.photos/api/auth/google/callback`
   - `http://localhost:4321/api/auth/google/callback` (local development)
6. Keep the client ID and client secret.

### 2.4 Secrets

Set each one in Cloudflare (you are prompted for the value; nothing is written
to the repository):

```bash
npx wrangler secret put RESEND_API_KEY
```

Repeat for `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET` and
`ADMIN_EMAILS`.

- `SESSION_SECRET` — any long random string. Generate one with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- `ADMIN_EMAILS` — comma-separated Google accounts allowed into `/admin`.
  **Adding an admin later means updating this secret and nothing else.**

Non-secret settings (`OWNER_EMAIL`, `FROM_EMAIL`, `FROM_NAME`,
`GOOGLE_CALENDAR_ID`, `SITE_URL`) live in the `vars` block of `wrangler.jsonc`.

---

## 3. Local development

Copy `.dev.vars.example` to `.dev.vars` and fill it in. That file is gitignored
and is the local stand-in for the Cloudflare secrets.

```bash
npm run dev
```

The site runs at `http://localhost:4321` with the real D1 binding attached to a
local SQLite file under `.wrangler/`.

Useful queries:

```bash
npx wrangler d1 execute ruina-bookings --local --command "SELECT * FROM leads ORDER BY created_at DESC"
```

```bash
npx wrangler d1 execute ruina-bookings --local --command "DELETE FROM leads; DELETE FROM rate_limits;"
```

Before committing (the pre-commit hook runs these anyway):

```bash
npm run prettier && npm run lint && npx tsc --noEmit && npm run build
```

---

## 4. Deploying

```bash
npm run deploy
```

That builds and runs `wrangler deploy`, publishing to
`https://ruina-photos.<your-subdomain>.workers.dev`.

Pushing to `main` does the same through
`.github/workflows/deploy.yml`, which needs a `CLOUDFLARE_API_TOKEN` repository
secret (GitHub → Settings → Secrets and variables → Actions). Create the token
in Cloudflare from the **Edit Cloudflare Workers** template.

### Custom domain

A Worker can only take a custom domain whose zone is on Cloudflare.

1. Cloudflare dashboard → **Add a site** → `ruina.photos` → Free plan.
2. Repoint the nameservers at your registrar to the two Cloudflare gives you.
   Check the imported DNS records against your registrar's first — anything
   Cloudflare missed (mail records especially) must be re-added before the
   switch.
3. Workers & Pages → `ruina-photos` → Settings → **Domains & Routes** → Add →
   Custom domain → `ruina.photos`.

Only after the domain resolves should you verify it in Resend and add the
production redirect URI in Google.

---

## 5. Day-to-day

- **`/admin`** — sign in with an allowlisted Google account. Enquiries are
  listed newest first, with inline status, private notes, CSV export and a
  **Schedule** button that turns an enquiry into a calendar booking (prefilled
  with the visitor's date and email, and linked back to the enquiry).
- **Calendar** — click a day to add a booking, click a booking to edit or delete
  it. All of it goes straight to the Google Calendar named by
  `GOOGLE_CALENDAR_ID` (`primary` by default).
- **Auto-reply failures** — enquiries whose auto-reply bounced are flagged in
  amber with the underlying error. Reply by hand; the enquiry itself is safe.

---

## 6. Troubleshooting

| Symptom                                             | Cause and fix                                                                                                                                                                                   |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Google Calendar is not connected` in /admin        | No refresh token stored. Click **Reconnect Google**; make sure the OAuth consent granted the calendar scope.                                                                                    |
| `Google access expired. Please sign in again.`      | The refresh token was revoked (password change, consent withdrawn, or the app is in "testing" and the 7-day token expiry hit). Sign in again; publishing the consent screen stops it recurring. |
| Auto-replies marked failed with `Resend 401`        | `RESEND_API_KEY` is wrong or unset.                                                                                                                                                             |
| Auto-replies fail only for other people's addresses | The Resend domain is not verified yet.                                                                                                                                                          |
| `403 Not authorised` after Google sign-in           | The account is not in `ADMIN_EMAILS`.                                                                                                                                                           |
| Sign-in loops back to Google                        | Cookies blocked, or the redirect URI in Google does not exactly match the site's origin.                                                                                                        |
| `Invalid binding SESSION` at build                  | Astro sessions want a KV namespace. This project does not use them; ignore, or add a `SESSION` KV binding.                                                                                      |

---

## 7. Notes on the security choices

- Sessions are opaque random ids in D1, not signed tokens — deleting the row
  revokes access immediately.
- Cookies are HttpOnly, SameSite=Lax, and carry the `__Host-` prefix over HTTPS
  (the prefix is dropped on `http://localhost`, which cannot set Secure cookies).
- The Google client secret and refresh token never leave the Worker; the browser
  only ever talks to `/api/admin/calendar`.
- `/api/booking` is the only unauthenticated write path: honeypot, per-IP rate
  limit (5 per 15 minutes), hard length caps, and an allowlist for the shoot-type
  field. Client IPs are stored only as a salted SHA-256 hash.
- Every D1 statement is parameterised.
- `/admin` sends `X-Robots-Tag: noindex, nofollow` and `Cache-Control: no-store`,
  and `public/robots.txt` disallows `/admin` and `/api/`.
