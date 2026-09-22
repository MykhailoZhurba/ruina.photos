globalThis.process ??= {}; globalThis.process.env ??= {};
const LEAD_STATUSES = ["new", "contacted", "booked", "archived"];
function isLeadStatus(value) {
  return typeof value === "string" && LEAD_STATUSES.includes(value);
}
async function hashIp(ip, secret) {
  const data = new TextEncoder().encode(`${secret}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function checkRateLimit(db, key, limit, windowSeconds) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const row = await db.prepare(
    `INSERT INTO rate_limits (key, count, window_start)
			 VALUES (?1, 1, ?2)
			 ON CONFLICT(key) DO UPDATE SET
			   count = CASE
			     WHEN strftime('%s', ?2) - strftime('%s', rate_limits.window_start) >= ?3 THEN 1
			     ELSE rate_limits.count + 1 END,
			   window_start = CASE
			     WHEN strftime('%s', ?2) - strftime('%s', rate_limits.window_start) >= ?3 THEN ?2
			     ELSE rate_limits.window_start END
			 RETURNING count, window_start`
  ).bind(key, now, windowSeconds).first();
  if (row === null) return { allowed: true, retryAfterSeconds: 0 };
  if (row.count > limit) {
    const elapsed = (Date.parse(now) - Date.parse(row.window_start)) / 1e3;
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil(windowSeconds - elapsed)) };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}
async function insertLead(db, input, meta) {
  const id = crypto.randomUUID();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await db.prepare(
    `INSERT INTO leads
			   (id, email, name, preferred_date, shoot_type, message,
			    status, email_status, source_ip_hash, user_agent, created_at, updated_at)
			 VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'new', 'pending', ?7, ?8, ?9, ?9)`
  ).bind(
    id,
    input.email,
    input.name,
    input.preferredDate,
    input.shootType,
    input.message,
    meta.ipHash,
    meta.userAgent,
    now
  ).run();
  return {
    id,
    email: input.email,
    name: input.name,
    preferred_date: input.preferredDate,
    shoot_type: input.shootType,
    message: input.message,
    status: "new",
    admin_notes: null,
    calendar_event_id: null,
    email_status: "pending",
    email_error: null,
    created_at: now,
    updated_at: now
  };
}
async function setLeadEmailStatus(db, id, status, error) {
  await db.prepare(`UPDATE leads SET email_status = ?2, email_error = ?3, updated_at = ?4 WHERE id = ?1`).bind(id, status, error?.slice(0, 500) ?? null, (/* @__PURE__ */ new Date()).toISOString()).run();
}
async function listLeads(db, opts) {
  const where = opts.status ? "WHERE status = ?3" : "";
  const binds = [opts.limit, opts.offset];
  if (opts.status) binds.push(opts.status);
  const [rows, count] = await db.batch([
    db.prepare(`SELECT * FROM leads ${where} ORDER BY created_at DESC LIMIT ?1 OFFSET ?2`).bind(...binds),
    opts.status ? db.prepare("SELECT COUNT(*) AS total FROM leads WHERE status = ?1").bind(opts.status) : db.prepare("SELECT COUNT(*) AS total FROM leads")
  ]);
  return {
    leads: rows.results ?? [],
    total: count.results?.[0]?.total ?? 0
  };
}
async function updateLead(db, id, patch) {
  const sets = [];
  const binds = [];
  if (patch.status !== void 0) {
    binds.push(patch.status);
    sets.push(`status = ?${binds.length}`);
  }
  if (patch.adminNotes !== void 0) {
    binds.push(patch.adminNotes?.slice(0, 4e3) ?? null);
    sets.push(`admin_notes = ?${binds.length}`);
  }
  if (patch.calendarEventId !== void 0) {
    binds.push(patch.calendarEventId);
    sets.push(`calendar_event_id = ?${binds.length}`);
  }
  if (sets.length === 0) return getLead(db, id);
  binds.push((/* @__PURE__ */ new Date()).toISOString());
  sets.push(`updated_at = ?${binds.length}`);
  binds.push(id);
  return db.prepare(`UPDATE leads SET ${sets.join(", ")} WHERE id = ?${binds.length} RETURNING *`).bind(...binds).first();
}
async function getLead(db, id) {
  return db.prepare("SELECT * FROM leads WHERE id = ?1").bind(id).first();
}
async function deleteLead(db, id) {
  const result = await db.prepare("DELETE FROM leads WHERE id = ?1").bind(id).run();
  return (result.meta.changes ?? 0) > 0;
}

export { LEAD_STATUSES as L, insertLead as a, checkRateLimit as c, deleteLead as d, hashIp as h, isLeadStatus as i, listLeads as l, setLeadEmailStatus as s, updateLead as u };
