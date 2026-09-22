# Google OAuth client — setup guide

This creates the Google credentials that let you sign in to `/admin` and let the
site read and write your Google Calendar. It takes about 15 minutes, once.

You finish with two values — a **client ID** and a **client secret** — which go
into Cloudflare as the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` secrets.

---

## What the site asks Google for

These are fixed in `src/lib/google.ts`. Every setting below exists to make
Google accept exactly this request.

| Setting       | Value                                                                    | Why                                                           |
| ------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------- |
| Flow          | Authorization code, server-side                                          | The Worker exchanges the code; the browser never sees a token |
| Client type   | Web application                                                          | Required for a server-side redirect flow                      |
| Redirect URI  | `https://ruina.photos/api/auth/google/callback`                          | Where Google sends you back after sign-in                     |
| Scopes        | `openid`, `email`, `profile`, `https://www.googleapis.com/auth/calendar` | Identity for the admin allowlist, plus read/write calendar    |
| `access_type` | `offline`                                                                | Makes Google issue a refresh token                            |
| `prompt`      | `consent`                                                                | Guarantees a fresh refresh token on every sign-in             |

The site then checks the returned identity against `ADMIN_EMAILS`. Signing in
with any other Google account is refused with a 403, even if Google lets you
through.

---

## Before you start

- Sign in to Google with the account that **owns the calendar** you want the
  dashboard to manage. That is the account you will sign in to `/admin` with,
  and it must match `ADMIN_EMAILS` exactly.
- Have the Cloudflare dashboard open in another tab for step 7.

---

## Step 1 — Create a Google Cloud project

1. Open <https://console.cloud.google.com>.
2. Use the project picker at the top of the page → **New project**.
3. Name it something recognisable, e.g. `ruina-photos`. No organisation is
   needed.
4. Create it, then make sure it is **selected** in the project picker before
   continuing. Every following step applies to whichever project is selected —
   doing them in the wrong project is the most common way this goes wrong.

## Step 2 — Enable the Google Calendar API

1. Go to **APIs & Services → Library**.
2. Search for **Google Calendar API**, open it, and press **Enable**.

Skip this and sign-in still works, but every calendar request fails with a 403
"API has not been used in project … or it is disabled". The dashboard shows that
as _Google Calendar request failed_.

## Step 3 — Branding (the consent screen)

Open **Google Auth Platform** (in the left menu, or search for it). If the
project has never been configured it offers **Get started**.

1. **App name**: `Ruina Photos`. This is what the consent screen shows you.
2. **User support email**: your address.
3. **Developer contact email**: your address.
4. Leave logo, home page and privacy links empty for now. Adding a logo can
   trigger brand verification, which you do not need.

## Step 4 — Audience

This is the decision that matters most.

1. **User type: External.** _Internal_ is only available to Google Workspace
   organisations; a personal `@gmail.com` account cannot use it.
2. **Publishing status** — pick one:

### Recommended: publish to production, without verification

Press **Publish app** on the Audience page. **Do not** submit for
verification.

- Your refresh token then lasts indefinitely, so the calendar connection keeps
  working.
- Because the Calendar scope is sensitive and the app is unverified, Google
  shows a _"Google hasn't verified this app"_ screen when you sign in (see step
  8). You click through it once per sign-in.
- Unverified apps are capped at 100 new users. You are the only user, so the cap
  never matters.

### Alternative: stay in Testing

Add your own address under **Test users**.

- Works immediately with no warning screen.
- **But the refresh token expires after 7 days.** Google applies this to
  External apps in Testing unless they request only name, email and profile —
  and this app requests the Calendar scope. Every week the calendar panel will
  show _Google access expired. Please sign in again._ and you re-sign-in. Nothing
  is lost; it is just a weekly chore.
- Anyone not on the test-user list is blocked outright.

Testing is fine for trying things out. Switch to production once it works.

## Step 5 — Data Access (scopes)

On the **Data Access** page, **Add or remove scopes** and select:

- `.../auth/userinfo.email`
- `.../auth/userinfo.profile`
- `openid`
- `https://www.googleapis.com/auth/calendar`

Use the full `calendar` scope, not `calendar.readonly` or `calendar.events` — the
dashboard creates, edits and deletes bookings. If the Calendar scope does not
appear in the list, step 2 was done in a different project.

The sign-in request itself names these scopes, so this page is not what makes
sign-in work. Declaring them keeps the consent screen accurate and is required
if you ever do seek verification.

## Step 6 — Create the OAuth client

1. Go to **Clients → Create client**.
2. **Application type: Web application.**
3. **Name**: `ruina-photos web` (only you see this).
4. **Authorised JavaScript origins**: leave **empty**. This is a server-side
   flow; origins are only for browser-based sign-in.
5. **Authorised redirect URIs** — add both:

   ```
   https://ruina.photos/api/auth/google/callback
   http://localhost:4321/api/auth/google/callback
   ```

   The first is production. The second lets `/admin` work under `npm run dev`.

   These must match **character for character** — scheme, host, port, path and
   the absence of a trailing slash. Google compares them exactly.

   You do **not** need `www.ruina.photos`: it redirects to `ruina.photos` before
   any page loads, so the callback is always on the apex. Cloudflare preview URLs
   (`*.ruina-photos.pages.dev`) are also omitted on purpose — the secrets are set
   on Production only, so `/admin` is not meant to work on previews.

6. **Create**.

## Step 7 — Copy the credentials

The dialog shows the **Client ID** and **Client secret**.

**Copy the secret now.** Newer versions of the console only show a client
secret in full when it is created. If you lose it, add a new secret to the
client and delete the old one — the client ID stays the same.

Put them in Cloudflare → Workers & Pages → `ruina-photos` → Settings → Variables
and secrets, **Production** environment, type **Secret**:

| Name                   | Value                                      |
| ---------------------- | ------------------------------------------ |
| `GOOGLE_CLIENT_ID`     | ends in `.apps.googleusercontent.com`      |
| `GOOGLE_CLIENT_SECRET` | starts with `GOCSPX-`                      |
| `ADMIN_EMAILS`         | the Google account from "Before you start" |

For local development, put the same two values in `.dev.vars` (gitignored).

Variables apply on the **next deployment**, so redeploy after saving.

## Step 8 — First sign-in

1. Open <https://ruina.photos/admin>. You are sent to Google.
2. If you published without verification: Google shows _"Google hasn't verified
   this app"_. Choose **Advanced**, then **Go to Ruina Photos (unsafe)**. It is
   "unsafe" only in the sense that Google has not reviewed it — it is your own
   app.
3. The consent screen lists the calendar permission. Tick it if a checkbox is
   shown — **if you leave the calendar box unticked, sign-in succeeds but every
   calendar request fails**.
4. You land on `/admin` with the enquiries table and the calendar.

---

## Check it worked

- The header of `/admin` shows your email.
- The calendar panel shows your real events for the month, not _Google Calendar
  is not connected_.
- Click a day, create a test booking, and confirm it appears in Google Calendar.
  Delete it from the dashboard and confirm it disappears there too.

---

## Troubleshooting

| What you see                                                                             | Cause                                                                                                       | Fix                                                                        |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Google: `Error 400: redirect_uri_mismatch`                                               | The URI in step 6 differs from the one the site sent — often `http` vs `https`, a trailing slash, or a typo | Google's error page shows the exact URI it received; add that exact string |
| Google: `Error 403: access_denied` / _has not completed the Google verification process_ | App is in Testing and your account is not a test user                                                       | Add yourself as a test user, or publish (step 4)                           |
| Google: `Error 401: invalid_client`                                                      | Client ID or secret wrong, or from a different project                                                      | Re-copy both from the same client                                          |
| Site: _Google sign-in is not configured_                                                 | `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET` not set, or not redeployed since                               | Set both, then redeploy                                                    |
| Site: _Not authorised — … is not on the admin list_                                      | Signed in with a Google account that is not in `ADMIN_EMAILS`                                               | Sign in with the right account, or fix `ADMIN_EMAILS`                      |
| Site: _The identity token from Google was not valid_                                     | Usually `GOOGLE_CLIENT_ID` does not match the client that issued the token                                  | Make sure the ID in Cloudflare is from this client                         |
| Calendar: _Google Calendar is not connected_                                             | No refresh token stored yet                                                                                 | Sign out and back in                                                       |
| Calendar: _Google access expired. Please sign in again._                                 | Refresh token revoked or expired — the 7-day Testing limit, a revoked grant, or six months unused           | Sign in again; publish the app to stop the weekly expiry                   |
| Calendar: _Google Calendar request failed_                                               | Calendar API not enabled, or the calendar scope was not granted                                             | Step 2, and tick the calendar box in step 8                                |

---

## Revoking and rotating

- **Disconnect the site from your Google account**:
  <https://myaccount.google.com/permissions> → Ruina Photos → Remove access.
  The next calendar request reports _access expired_; signing in again
  reconnects it.
- **Rotate the client secret**: add a new secret to the client, update
  `GOOGLE_CLIENT_SECRET` in Cloudflare, redeploy, then delete the old secret.
- **End an admin session immediately**: delete its row from the D1 `sessions`
  table. Sessions are opaque ids, so this takes effect at once.

Each sign-in issues a new refresh token (that is what `prompt=consent` does).
Google keeps up to 100 per account per client and silently retires the oldest.
The site only ever stores the newest, so this never causes a problem.
