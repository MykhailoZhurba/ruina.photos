globalThis.process ??= {}; globalThis.process.env ??= {};
const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const CALENDAR_API = "https://www.googleapis.com/calendar/v3";
const SCOPES = ["openid", "email", "profile", "https://www.googleapis.com/auth/calendar"];
function redirectUriFor(url) {
  return new URL("/api/auth/google/callback", url.origin).toString();
}
function buildAuthUrl(env, redirectUri, state) {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(" "),
    // `offline` + `consent` guarantee a refresh token, including on re-consent.
    // `select_account` always shows Google's account picker: without it, a
    // browser signed in to several Google accounts silently uses the default
    // one, which may not be the admin account.
    access_type: "offline",
    prompt: "consent select_account",
    include_granted_scopes: "true",
    state
  });
  return AUTH_ENDPOINT + "?" + params.toString();
}
async function postToken(body) {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error("Google token endpoint " + response.status + ": " + detail.slice(0, 300));
  }
  return response.json();
}
async function exchangeCode(env, code, redirectUri) {
  return postToken(
    new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    })
  );
}
function decodeBase64Url(segment) {
  const normalised = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalised.padEnd(Math.ceil(normalised.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
function emailFromIdToken(idToken, expectedClientId) {
  const parts = idToken.split(".");
  if (parts.length !== 3) return null;
  let payload;
  try {
    payload = JSON.parse(decodeBase64Url(parts[1]));
  } catch {
    return null;
  }
  const issuer = payload.iss;
  if (issuer !== "https://accounts.google.com" && issuer !== "accounts.google.com") return null;
  if (payload.aud !== expectedClientId) return null;
  if (typeof payload.exp !== "number" || payload.exp * 1e3 <= Date.now()) return null;
  if (payload.email_verified !== true) return null;
  if (typeof payload.email !== "string") return null;
  return payload.email.toLowerCase();
}
async function storeTokens(db, email, tokens) {
  const now = /* @__PURE__ */ new Date();
  const accessExpires = new Date(now.getTime() + (tokens.expiresIn - 60) * 1e3).toISOString();
  if (tokens.refreshToken) {
    await db.prepare(
      `INSERT INTO oauth_tokens (email, refresh_token, access_token, access_token_expires_at, updated_at)
				 VALUES (?1, ?2, ?3, ?4, ?5)
				 ON CONFLICT(email) DO UPDATE SET
				   refresh_token = excluded.refresh_token,
				   access_token = excluded.access_token,
				   access_token_expires_at = excluded.access_token_expires_at,
				   updated_at = excluded.updated_at`
    ).bind(email, tokens.refreshToken, tokens.accessToken, accessExpires, now.toISOString()).run();
    return;
  }
  await db.prepare(
    `UPDATE oauth_tokens
			 SET access_token = ?2, access_token_expires_at = ?3, updated_at = ?4
			 WHERE email = ?1`
  ).bind(email, tokens.accessToken, accessExpires, now.toISOString()).run();
}
async function getAccessToken(db, env) {
  const row = await db.prepare(
    "SELECT email, refresh_token, access_token, access_token_expires_at FROM oauth_tokens LIMIT 1"
  ).first();
  if (row === null) throw new Error("NOT_CONNECTED");
  if (row.access_token !== null && row.access_token_expires_at !== null && Date.parse(row.access_token_expires_at) > Date.now()) {
    return row.access_token;
  }
  const refreshed = await postToken(
    new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: row.refresh_token,
      grant_type: "refresh_token"
    })
  );
  await storeTokens(db, row.email, {
    accessToken: refreshed.access_token,
    expiresIn: refreshed.expires_in
  });
  return refreshed.access_token;
}
async function calendarFetch(accessToken, path, init = {}) {
  const response = await fetch(CALENDAR_API + path, {
    ...init,
    headers: {
      Authorization: "Bearer " + accessToken,
      "Content-Type": "application/json",
      ...init.headers ?? {}
    }
  });
  if (response.status === 204) return null;
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error("Calendar API " + response.status + ": " + detail.slice(0, 300));
  }
  return response.json();
}
function calendarPath(env, suffix = "") {
  return "/calendars/" + encodeURIComponent(env.GOOGLE_CALENDAR_ID) + "/events" + suffix;
}
async function listEvents(accessToken, env, range) {
  const params = new URLSearchParams({
    timeMin: range.timeMin,
    timeMax: range.timeMax,
    // Expand recurring events so the admin view shows real occurrences.
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "250"
  });
  const data = await calendarFetch(accessToken, calendarPath(env) + "?" + params.toString());
  return data.items ?? [];
}
function toGoogleEvent(input) {
  const isAllDay = /^\d{4}-\d{2}-\d{2}$/.test(input.start);
  return {
    summary: input.summary,
    description: input.description,
    location: input.location,
    start: isAllDay ? { date: input.start } : { dateTime: new Date(input.start).toISOString() },
    end: isAllDay ? { date: input.end } : { dateTime: new Date(input.end).toISOString() },
    ...input.attendeeEmail ? { attendees: [{ email: input.attendeeEmail }] } : {}
  };
}
async function createEvent(accessToken, env, input) {
  return await calendarFetch(accessToken, calendarPath(env), {
    method: "POST",
    body: JSON.stringify(toGoogleEvent(input))
  });
}
async function updateEvent(accessToken, env, eventId, input) {
  return await calendarFetch(accessToken, calendarPath(env, "/" + encodeURIComponent(eventId)), {
    method: "PATCH",
    body: JSON.stringify(toGoogleEvent(input))
  });
}
async function deleteEvent(accessToken, env, eventId) {
  await calendarFetch(accessToken, calendarPath(env, "/" + encodeURIComponent(eventId)), {
    method: "DELETE"
  });
}

export { emailFromIdToken as a, buildAuthUrl as b, createEvent as c, deleteEvent as d, exchangeCode as e, getAccessToken as g, listEvents as l, redirectUriFor as r, storeTokens as s, updateEvent as u };
