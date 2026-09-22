globalThis.process ??= {}; globalThis.process.env ??= {};
import { g as getAccessToken, l as listEvents, c as createEvent, u as updateEvent, d as deleteEvent } from '../../../chunks/google_Bl6EIWms.mjs';
import { u as updateLead } from '../../../chunks/db_DqN0KZx9.mjs';
import { c as currentAdmin, i as isSameOrigin } from '../../../chunks/session_BEjCJbxK.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow"
    }
  });
}
function googleFailure(cause) {
  const detail = cause instanceof Error ? cause.message : String(cause);
  if (detail === "NOT_CONNECTED") {
    return json({ ok: false, error: "Google Calendar is not connected.", reconnect: true }, 409);
  }
  console.error("admin/calendar: google call failed", detail);
  if (detail.includes("401") || detail.includes("invalid_grant")) {
    return json(
      { ok: false, error: "Google access expired. Please sign in again.", reconnect: true },
      409
    );
  }
  return json({ ok: false, error: "Google Calendar request failed." }, 502);
}
function readEventInput(body) {
  const summary = typeof body.summary === "string" ? body.summary.trim() : "";
  const start = typeof body.start === "string" ? body.start.trim() : "";
  const end = typeof body.end === "string" ? body.end.trim() : "";
  if (summary === "") return "Give the booking a title.";
  if (start === "" || end === "") return "A booking needs a start and an end.";
  const isAllDay = /^\d{4}-\d{2}-\d{2}$/.test(start);
  if (!isAllDay && Number.isNaN(Date.parse(start))) return "That start time is not valid.";
  if (!isAllDay && Number.isNaN(Date.parse(end))) return "That end time is not valid.";
  if (!isAllDay && Date.parse(end) <= Date.parse(start)) {
    return "The booking has to end after it starts.";
  }
  return {
    summary: summary.slice(0, 300),
    description: typeof body.description === "string" ? body.description.slice(0, 4e3) : void 0,
    location: typeof body.location === "string" ? body.location.slice(0, 300) : void 0,
    start,
    end,
    attendeeEmail: typeof body.attendeeEmail === "string" ? body.attendeeEmail : void 0
  };
}
const GET = async ({ url, cookies, locals }) => {
  const env = locals.runtime.env;
  const admin = await currentAdmin(env.DB, cookies, url);
  if (admin === null) return json({ ok: false, error: "Not signed in." }, 401);
  const now = /* @__PURE__ */ new Date();
  const defaultMin = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const defaultMax = new Date(now.getFullYear(), now.getMonth() + 3, 0).toISOString();
  const timeMin = url.searchParams.get("timeMin") ?? defaultMin;
  const timeMax = url.searchParams.get("timeMax") ?? defaultMax;
  if (Number.isNaN(Date.parse(timeMin)) || Number.isNaN(Date.parse(timeMax))) {
    return json({ ok: false, error: "Invalid date range." }, 400);
  }
  try {
    const accessToken = await getAccessToken(env.DB, env);
    const events = await listEvents(accessToken, env, { timeMin, timeMax });
    return json({ ok: true, events, calendarId: env.GOOGLE_CALENDAR_ID });
  } catch (cause) {
    return googleFailure(cause);
  }
};
const POST = async ({ request, url, cookies, locals }) => {
  const env = locals.runtime.env;
  const admin = await currentAdmin(env.DB, cookies, url);
  if (admin === null) return json({ ok: false, error: "Not signed in." }, 401);
  if (!isSameOrigin(request, url)) return json({ ok: false, error: "Rejected." }, 403);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Malformed request." }, 400);
  }
  const input = readEventInput(body);
  if (typeof input === "string") return json({ ok: false, error: input }, 400);
  try {
    const accessToken = await getAccessToken(env.DB, env);
    const event = await createEvent(accessToken, env, input);
    const leadId = typeof body.leadId === "string" ? body.leadId : null;
    if (leadId !== null) {
      await updateLead(env.DB, leadId, { status: "booked", calendarEventId: event.id }).catch(
        (cause) => console.error("admin/calendar: could not link lead", cause)
      );
    }
    return json({ ok: true, event });
  } catch (cause) {
    return googleFailure(cause);
  }
};
const PATCH = async ({ request, url, cookies, locals }) => {
  const env = locals.runtime.env;
  const admin = await currentAdmin(env.DB, cookies, url);
  if (admin === null) return json({ ok: false, error: "Not signed in." }, 401);
  if (!isSameOrigin(request, url)) return json({ ok: false, error: "Rejected." }, 403);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Malformed request." }, 400);
  }
  const eventId = typeof body.eventId === "string" ? body.eventId : null;
  if (eventId === null) return json({ ok: false, error: "Missing event id." }, 400);
  const input = readEventInput(body);
  if (typeof input === "string") return json({ ok: false, error: input }, 400);
  try {
    const accessToken = await getAccessToken(env.DB, env);
    const event = await updateEvent(accessToken, env, eventId, input);
    return json({ ok: true, event });
  } catch (cause) {
    return googleFailure(cause);
  }
};
const DELETE = async ({ request, url, cookies, locals }) => {
  const env = locals.runtime.env;
  const admin = await currentAdmin(env.DB, cookies, url);
  if (admin === null) return json({ ok: false, error: "Not signed in." }, 401);
  if (!isSameOrigin(request, url)) return json({ ok: false, error: "Rejected." }, 403);
  const eventId = url.searchParams.get("eventId");
  if (eventId === null) return json({ ok: false, error: "Missing event id." }, 400);
  try {
    const accessToken = await getAccessToken(env.DB, env);
    await deleteEvent(accessToken, env, eventId);
    return json({ ok: true });
  } catch (cause) {
    return googleFailure(cause);
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	DELETE,
	GET,
	PATCH,
	POST,
	prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
