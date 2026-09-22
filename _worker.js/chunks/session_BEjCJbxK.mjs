globalThis.process ??= {}; globalThis.process.env ??= {};
const SESSION_COOKIE = "__Host-ruina_session";
const OAUTH_STATE_COOKIE = "__Host-ruina_oauth_state";
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
const STATE_TTL_SECONDS = 10 * 60;
function randomId() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function cookieNames(url) {
  const secure = url.protocol === "https:";
  return {
    session: secure ? SESSION_COOKIE : "ruina_session",
    state: secure ? OAUTH_STATE_COOKIE : "ruina_oauth_state",
    secure
  };
}
function isAllowedAdmin(email, allowlist) {
  const allowed = allowlist.split(",").map((entry) => entry.trim().toLowerCase()).filter((entry) => entry.length > 0);
  return allowed.includes(email.trim().toLowerCase());
}
async function createSession(db, email) {
  const id = randomId();
  const now = /* @__PURE__ */ new Date();
  const expires = new Date(now.getTime() + SESSION_TTL_SECONDS * 1e3);
  await db.prepare("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?1, ?2, ?3, ?4)").bind(id, email.toLowerCase(), now.toISOString(), expires.toISOString()).run();
  await db.prepare("DELETE FROM sessions WHERE expires_at < ?1").bind(now.toISOString()).run().catch(() => void 0);
  return id;
}
async function getSession(db, id) {
  const row = await db.prepare("SELECT id, email, expires_at FROM sessions WHERE id = ?1").bind(id).first();
  if (row === null) return null;
  if (Date.parse(row.expires_at) <= Date.now()) {
    await deleteSession(db, id).catch(() => void 0);
    return null;
  }
  return { id: row.id, email: row.email };
}
async function deleteSession(db, id) {
  await db.prepare("DELETE FROM sessions WHERE id = ?1").bind(id).run();
}
function setSessionCookie(cookies, url, id) {
  const names = cookieNames(url);
  cookies.set(names.session, id, {
    httpOnly: true,
    secure: names.secure,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS
  });
}
function clearSessionCookie(cookies, url) {
  const names = cookieNames(url);
  cookies.delete(names.session, { path: "/" });
}
function setStateCookie(cookies, url, state) {
  const names = cookieNames(url);
  cookies.set(names.state, state, {
    httpOnly: true,
    secure: names.secure,
    sameSite: "lax",
    path: "/",
    maxAge: STATE_TTL_SECONDS
  });
}
function readStateCookie(cookies, url) {
  return cookies.get(cookieNames(url).state)?.value;
}
function clearStateCookie(cookies, url) {
  cookies.delete(cookieNames(url).state, { path: "/" });
}
async function currentAdmin(db, cookies, url) {
  const id = cookies.get(cookieNames(url).session)?.value;
  if (!id) return null;
  return getSession(db, id);
}
function isSameOrigin(request, url) {
  const origin = request.headers.get("origin");
  if (origin === null) return true;
  try {
    return new URL(origin).origin === url.origin;
  } catch {
    return false;
  }
}

export { clearStateCookie as a, isAllowedAdmin as b, currentAdmin as c, createSession as d, setStateCookie as e, cookieNames as f, deleteSession as g, clearSessionCookie as h, isSameOrigin as i, readStateCookie as r, setSessionCookie as s };
