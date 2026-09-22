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
| Local-dev bindings and vars       | `wrangler.jsonc` (ignored by Pages; see 2.1)                                        |

The gallery, About, privacy and collections pages are prerendered static HTML.
Only `/admin` and `/api/*` run server-side, as Pages Functions, via
`export const prerender = false`.

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

Production runs on the Cloudflare **Pages** project `ruina-photos`. It builds
every push to `main` (`npm run build` → `dist`) and serves `ruina.photos`, whose
DNS is already on Cloudflare.

> **Pages ignores `wrangler.jsonc`.** The file has no `pages_build_output_dir`,
> so Pages skips it and says so in the build log. Everything production needs —
> the D1 binding, the variables and the secrets — is set in the **Pages
> dashboard**. `wrangler.jsonc` only drives local development.

1. Create the database (once):

   ```bash
   npx wrangler login
   ```

   ```bash
   npx wrangler d1 create ruina-bookings
   ```

   Put the printed `database_id` in `wrangler.jsonc` for local development.

2. Bind it to production: Pages → `ruina-photos` → Settings → **Bindings** →
   Add → D1 database. The variable name must be **`DB`** exactly, because the
   code reads `env.DB`. Naming it after the database (`ruina-bookings`) leaves
   `env.DB` undefined and every booking returns 500.

3. Apply the schema, to production and to your local copy:

   ```bash
   npm run db:migrate:remote
   ```

   ```bash
   npm run db:migrate:local
   ```

   Skipping the remote one also makes every booking return 500, with
   `no such table` in the Pages Functions log.

### 2.2 Resend (email)

1. Create an account at [resend.com](https://resend.com).
2. **Add and verify the domain `ruina.photos`.** Resend shows the exact DNS
   records to add (an MX and TXT pair on a `send.` subdomain, plus a DKIM TXT
   record at `resend._domainkey`). Add them in the Cloudflare DNS dashboard.
   **Until the domain is verified, every email from `bookings@ruina.photos` is
   rejected** — the visitor's auto-reply and your notification alike. Enquiries
   are still stored and shown in `/admin` with an amber _auto-reply not
   delivered_ flag, so nothing is lost; you just are not emailed about them.
3. Create an API key and keep it for the next step.

`FROM_EMAIL` must be on the verified domain
(`bookings@ruina.photos`). `OWNER_EMAIL` is where notifications and visitor
replies go and can be any address.

### 2.3 Google (admin sign-in + Calendar)

Full walkthrough: **[GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md)**. In short:

1. Create a Google Cloud project and **enable the Google Calendar API**.
2. Google Auth Platform → Branding, then Audience → **External**.
3. **Publish to production without submitting for verification.** In Testing,
   Google expires refresh tokens after 7 days because the app requests the
   Calendar scope, so the calendar would disconnect weekly.
4. Clients → **Web application**, with exactly these redirect URIs:
   - `https://ruina.photos/api/auth/google/callback`
   - `http://localhost:4321/api/auth/google/callback` (local development)
5. Copy the client ID and secret immediately — newer consoles show the secret
   only once.

### 2.4 Variables and secrets

Pages → `ruina-photos` → Settings → **Variables and secrets**, **Production**
environment:

| Type   | Name                   | Value                                              |
| ------ | ---------------------- | -------------------------------------------------- |
| Secret | `RESEND_API_KEY`       | from resend.com/api-keys                           |
| Secret | `SESSION_SECRET`       | long random string (see below)                     |
| Secret | `ADMIN_EMAILS`         | Google account(s) allowed into `/admin`            |
| Secret | `GOOGLE_CLIENT_ID`     | see [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md) |
| Secret | `GOOGLE_CLIENT_SECRET` | see [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md) |
| Text   | `OWNER_EMAIL`          | where notifications and replies go                 |
| Text   | `FROM_EMAIL`           | `bookings@ruina.photos`                            |
| Text   | `FROM_NAME`            | `Ruina Photos`                                     |
| Text   | `GOOGLE_CALENDAR_ID`   | `primary`                                          |
| Text   | `SITE_URL`             | `https://ruina.photos`                             |

Set these on **Production only**. Previews then have no database or mail
access, so a branch build can never write to the live bookings or send real
email.

Secrets can also be set from the command line:

```bash
npx wrangler pages secret put RESEND_API_KEY --project-name ruina-photos
```

**Changes apply on the next deployment**, not immediately.

- `SESSION_SECRET` — any long random string. Generate one with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- `ADMIN_EMAILS` — comma-separated Google accounts allowed into `/admin`.
  **Adding an admin later means updating this secret and nothing else.**

The `vars` block in `wrangler.jsonc` mirrors the Text rows above for local
development only; editing it does not change production.

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

**Merge to `main`.** The Pages Git integration builds it and deploys it to
`ruina.photos` automatically. Every other branch gets a preview at
`https://<branch>.ruina-photos.pages.dev`.

Previews carry no bindings or secrets (they are Production-only), so `/api/*`
returns 500 on a preview. That is intended.

To apply a changed variable or binding without a code change: Pages →
Deployments → the latest production deployment → **Retry deployment**.

`.github/workflows/deploy.yml` still publishes to the `gh-pages` branch, left
over from before the move to Cloudflare. `ruina.photos` is not served from it,
so it is redundant and can be removed.

### Checking a deploy

```bash
curl -s -X POST https://ruina.photos/api/booking -H "Content-Type: application/json" -d "{}"
```

Expect status 400 with `"error":"Please enter your email address."`. That proves
the Function runs and validates. A 500 means the binding or schema is missing
(see 2.1); a 405 or an HTML page means the deployment has no Functions at all.

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

| Symptom                                        | Cause and fix                                                                                                                                                                                   |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Google Calendar is not connected` in /admin   | No refresh token stored. Click **Reconnect Google**; make sure the OAuth consent granted the calendar scope.                                                                                    |
| `Google access expired. Please sign in again.` | The refresh token was revoked (password change, consent withdrawn, or the app is in "testing" and the 7-day token expiry hit). Sign in again; publishing the consent screen stops it recurring. |
| Auto-replies marked failed with `Resend 401`   | `RESEND_API_KEY` is wrong or unset.                                                                                                                                                             |
| Every email marked failed with `Resend 403`    | `ruina.photos` is not verified in Resend; see 2.2.                                                                                                                                              |
| Every booking returns 500                      | The D1 binding is not named `DB`, or the schema was never applied remotely; see 2.1.                                                                                                            |
| A variable change has no effect                | Variables apply on the next deployment; retry the latest one (see 4).                                                                                                                           |
| `403 Not authorised` after Google sign-in      | The account is not in `ADMIN_EMAILS`.                                                                                                                                                           |
| Sign-in loops back to Google                   | Cookies blocked, or the redirect URI in Google does not exactly match the site's origin.                                                                                                        |
| `Invalid binding SESSION` at build             | Astro sessions want a KV namespace. This project does not use them; ignore, or add a `SESSION` KV binding.                                                                                      |

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
