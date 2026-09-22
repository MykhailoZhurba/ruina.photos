globalThis.process ??= {}; globalThis.process.env ??= {};
import { l as listLeads, i as isLeadStatus, u as updateLead, d as deleteLead } from '../../../chunks/db_DqN0KZx9.mjs';
import { c as currentAdmin, i as isSameOrigin } from '../../../chunks/session_BEjCJbxK.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const MAX_PAGE_SIZE = 200;
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
const UNAUTHORISED = () => json({ ok: false, error: "Not signed in." }, 401);
const GET = async ({ url, cookies, locals }) => {
  const env = locals.runtime.env;
  const admin = await currentAdmin(env.DB, cookies, url);
  if (admin === null) return UNAUTHORISED();
  const limit = Math.min(
    Math.max(Number(url.searchParams.get("limit") ?? "100") || 100, 1),
    MAX_PAGE_SIZE
  );
  const offset = Math.max(Number(url.searchParams.get("offset") ?? "0") || 0, 0);
  const statusParam = url.searchParams.get("status");
  const status = isLeadStatus(statusParam) ? statusParam : void 0;
  try {
    const { leads, total } = await listLeads(env.DB, { limit, offset, status });
    return json({ ok: true, leads, total, limit, offset });
  } catch (cause) {
    console.error("admin/leads: list failed", cause);
    return json({ ok: false, error: "Could not load enquiries." }, 500);
  }
};
const PATCH = async ({ request, url, cookies, locals }) => {
  const env = locals.runtime.env;
  const admin = await currentAdmin(env.DB, cookies, url);
  if (admin === null) return UNAUTHORISED();
  if (!isSameOrigin(request, url)) return json({ ok: false, error: "Rejected." }, 403);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Malformed request." }, 400);
  }
  const id = typeof body.id === "string" ? body.id : null;
  if (id === null) return json({ ok: false, error: "Missing enquiry id." }, 400);
  if (body.status !== void 0 && !isLeadStatus(body.status)) {
    return json({ ok: false, error: "Unknown status." }, 400);
  }
  try {
    const lead = await updateLead(env.DB, id, {
      status: isLeadStatus(body.status) ? body.status : void 0,
      adminNotes: body.adminNotes === void 0 ? void 0 : typeof body.adminNotes === "string" && body.adminNotes.trim() !== "" ? body.adminNotes : null,
      calendarEventId: body.calendarEventId === void 0 ? void 0 : typeof body.calendarEventId === "string" ? body.calendarEventId : null
    });
    if (lead === null) return json({ ok: false, error: "No such enquiry." }, 404);
    return json({ ok: true, lead });
  } catch (cause) {
    console.error("admin/leads: update failed", cause);
    return json({ ok: false, error: "Could not save the change." }, 500);
  }
};
const DELETE = async ({ request, url, cookies, locals }) => {
  const env = locals.runtime.env;
  const admin = await currentAdmin(env.DB, cookies, url);
  if (admin === null) return UNAUTHORISED();
  if (!isSameOrigin(request, url)) return json({ ok: false, error: "Rejected." }, 403);
  const id = url.searchParams.get("id");
  if (id === null) return json({ ok: false, error: "Missing enquiry id." }, 400);
  try {
    const removed = await deleteLead(env.DB, id);
    if (!removed) return json({ ok: false, error: "No such enquiry." }, 404);
    return json({ ok: true });
  } catch (cause) {
    console.error("admin/leads: delete failed", cause);
    return json({ ok: false, error: "Could not delete the enquiry." }, 500);
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	DELETE,
	GET,
	PATCH,
	prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
