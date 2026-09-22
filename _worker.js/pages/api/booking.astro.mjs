globalThis.process ??= {}; globalThis.process.env ??= {};
import { s as siteConfig } from '../../chunks/site.config_Bvlshszw.mjs';
import { h as hashIp, c as checkRateLimit, a as insertLead, s as setLeadEmailStatus } from '../../chunks/db_DqN0KZx9.mjs';
export { renderers } from '../../renderers.mjs';

const LIMITS = {
  email: 254,
  // RFC 5321 maximum
  name: 100,
  shootType: 60,
  preferredDate: 10,
  // YYYY-MM-DD
  message: 2e3
};
const CONTROL_CHARS = /[\p{Cc}]/gu;
function clean(raw, max) {
  if (typeof raw !== "string") return null;
  const value = raw.replace(CONTROL_CHARS, " ").replace(/\s+/g, " ").trim();
  if (value.length === 0) return null;
  return value.slice(0, max);
}
function cleanMultiline(raw, max) {
  if (typeof raw !== "string") return null;
  const value = raw.replace(/\r\n/g, "\n").split("\n").map(
    (line) => line.replace(CONTROL_CHARS, " ").replace(/[ \t]+/g, " ").trim()
  ).join("\n").replace(/\n{3,}/g, "\n\n").trim();
  if (value.length === 0) return null;
  return value.slice(0, max);
}
function isPlausibleEmail(value) {
  if (value.length > LIMITS.email) return false;
  if (/\s/.test(value)) return false;
  const at = value.indexOf("@");
  if (at < 1 || at !== value.lastIndexOf("@")) return false;
  const domain = value.slice(at + 1);
  if (domain.length < 3 || !domain.includes(".")) return false;
  if (domain.startsWith(".") || domain.endsWith(".") || domain.includes("..")) return false;
  if (domain.startsWith("-") || domain.endsWith("-")) return false;
  return true;
}
function normalizeDate(raw) {
  if (raw === null) return { ok: true, value: null };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return { ok: false };
  const parsed = /* @__PURE__ */ new Date(`${raw}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return { ok: false };
  if (parsed.toISOString().slice(0, 10) !== raw) return { ok: false };
  if (parsed.getTime() < Date.now() - 36 * 60 * 60 * 1e3) return { ok: false };
  return { ok: true, value: raw };
}
function validateBooking(body, allowedShootTypes) {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Malformed request." };
  }
  const input = body;
  if (clean(input.website, 100) !== null) {
    return { ok: false, error: "Rejected." };
  }
  const email = clean(input.email, LIMITS.email)?.toLowerCase() ?? null;
  if (email === null) {
    return { ok: false, error: "Please enter your email address.", field: "email" };
  }
  if (!isPlausibleEmail(email)) {
    return { ok: false, error: "That email address does not look right.", field: "email" };
  }
  const date = normalizeDate(clean(input.preferredDate, LIMITS.preferredDate));
  if (!date.ok) {
    return {
      ok: false,
      error: "Please choose a date that has not already passed.",
      field: "preferredDate"
    };
  }
  const shootTypeRaw = clean(input.shootType, LIMITS.shootType);
  const shootType = shootTypeRaw !== null && allowedShootTypes.includes(shootTypeRaw) ? shootTypeRaw : null;
  return {
    ok: true,
    value: {
      email,
      name: clean(input.name, LIMITS.name),
      preferredDate: date.value,
      shootType,
      message: cleanMultiline(input.message, LIMITS.message)
    }
  };
}

const RESEND_ENDPOINT = "https://api.resend.com/emails";
function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
async function send(env, args) {
  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: `${env.FROM_NAME} <${env.FROM_EMAIL}>`,
      to: [args.to],
      reply_to: args.replyTo,
      subject: args.subject,
      html: args.html,
      text: args.text
    })
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Resend ${response.status}: ${detail.slice(0, 300)}`);
  }
}
function layout(bodyHtml, ownerName) {
  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f6f6f6;font-family:Georgia,'Times New Roman',serif;color:#111;">
<div style="max-width:560px;margin:0 auto;background:#fff;padding:32px;border:1px solid #e5e5e5;">
${bodyHtml}
<p style="margin:32px 0 0;padding-top:16px;border-top:1px solid #eee;font-size:13px;color:#777;">
${escapeHtml(ownerName)} &middot; ruina.photos
</p>
</div></body></html>`;
}
function outstandingQuestions(lead) {
  const questions = [];
  if (lead.preferred_date === null)
    questions.push("What date (or rough window) do you have in mind?");
  if (lead.shoot_type === null) questions.push("What kind of shoot is it?");
  questions.push("Where would you like to shoot, and roughly how long do you need?");
  questions.push("How many people will be in front of the camera?");
  if (lead.message === null) questions.push("Anything else about the look or mood you are after?");
  return questions;
}
async function sendAutoReply(env, lead, ownerName) {
  const greeting = lead.name === null ? "Hello," : `Hi ${escapeHtml(lead.name)},`;
  const questions = outstandingQuestions(lead);
  const known = [];
  if (lead.shoot_type !== null) known.push(`a ${lead.shoot_type.toLowerCase()} shoot`);
  if (lead.preferred_date !== null) known.push(`around ${lead.preferred_date}`);
  const knownLine = known.length > 0 ? `<p style="margin:0 0 16px;">I have you down for ${escapeHtml(known.join(", "))}.</p>` : "";
  const html = layout(
    `<p style="margin:0 0 16px;">${greeting}</p>
<p style="margin:0 0 16px;">Thank you for getting in touch about a shoot — I am glad you did.</p>
${knownLine}
<p style="margin:0 0 12px;">To put together the right plan and a price, it would help to know:</p>
<ul style="margin:0 0 16px;padding-left:20px;">
${questions.map((q) => `<li style="margin-bottom:8px;">${escapeHtml(q)}</li>`).join("\n")}
</ul>
<p style="margin:0 0 16px;">Just reply to this email — no forms. I usually answer within a day or two.</p>
<p style="margin:0;">Looking forward to hearing more,<br />${escapeHtml(ownerName)}</p>`,
    ownerName
  );
  const text = `${lead.name === null ? "Hello," : `Hi ${lead.name},`}

Thank you for getting in touch about a shoot - I am glad you did.
${known.length > 0 ? `
I have you down for ${known.join(", ")}.
` : ""}
To put together the right plan and a price, it would help to know:

${questions.map((q) => `  - ${q}`).join("\n")}

Just reply to this email - no forms. I usually answer within a day or two.

Looking forward to hearing more,
${ownerName}
ruina.photos`;
  await send(env, {
    to: lead.email,
    subject: "About your shoot — a few details",
    html,
    text,
    // Replies land in the owner's inbox, not in the no-reply sending address.
    replyTo: env.OWNER_EMAIL
  });
}
async function sendOwnerNotification(env, lead) {
  const fields = [
    ["Email", lead.email],
    ["Name", lead.name ?? "—"],
    ["Preferred date", lead.preferred_date ?? "—"],
    ["Shoot type", lead.shoot_type ?? "—"],
    ["Message", lead.message ?? "—"]
  ];
  const rows = fields.map(
    ([label, value]) => `<tr>
<td style="padding:6px 12px 6px 0;vertical-align:top;color:#777;white-space:nowrap;">${escapeHtml(label)}</td>
<td style="padding:6px 0;vertical-align:top;white-space:pre-wrap;">${escapeHtml(value)}</td>
</tr>`
  ).join("\n");
  const adminUrl = `${env.SITE_URL}/admin`;
  const html = layout(
    `<p style="margin:0 0 16px;font-size:18px;">New booking enquiry</p>
<table style="border-collapse:collapse;font-size:15px;">${rows}</table>
<p style="margin:24px 0 0;"><a href="${escapeHtml(adminUrl)}" style="color:#111;">Open the admin dashboard</a></p>`,
    "ruina.photos"
  );
  const text = `New booking enquiry

${fields.map(([label, value]) => `${label}: ${value}`).join("\n")}

${adminUrl}`;
  await send(env, {
    to: env.OWNER_EMAIL,
    subject: `New booking enquiry — ${lead.email}`,
    html,
    text,
    // Lets the owner reply straight to the visitor from their inbox.
    replyTo: lead.email
  });
}

const prerender = false;
const RATE_LIMIT = { max: 5, windowSeconds: 900 };
const MAX_BODY_BYTES = 8 * 1024;
function json(body, status, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers }
  });
}
const SUCCESS = {
  ok: true,
  message: "Thank you — check your inbox, I have sent you a note."
};
const POST = async ({ request, locals, clientAddress }) => {
  const env = locals.runtime.env;
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json({ ok: false, error: "Expected JSON." }, 415);
  }
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > MAX_BODY_BYTES) {
    return json({ ok: false, error: "That message is too long." }, 413);
  }
  let body;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return json({ ok: false, error: "That message is too long." }, 413);
    }
    body = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: "Malformed request." }, 400);
  }
  const result = validateBooking(body, siteConfig.shootTypes);
  if (!result.ok) {
    if (result.error === "Rejected.") return json(SUCCESS, 200);
    return json({ ok: false, error: result.error, field: result.field }, 400);
  }
  const ip = request.headers.get("cf-connecting-ip") ?? clientAddress ?? "unknown";
  const ipHash = await hashIp(ip, env.SESSION_SECRET);
  const verdict = await checkRateLimit(
    env.DB,
    `booking:${ipHash}`,
    RATE_LIMIT.max,
    RATE_LIMIT.windowSeconds
  );
  if (!verdict.allowed) {
    return json(
      { ok: false, error: "That is a few enquiries in a row — please try again shortly." },
      429,
      { "Retry-After": String(verdict.retryAfterSeconds) }
    );
  }
  let lead;
  try {
    lead = await insertLead(env.DB, result.value, {
      ipHash,
      userAgent: request.headers.get("user-agent")?.slice(0, 300) ?? null
    });
  } catch (error) {
    console.error("booking: failed to store lead", error);
    return json({ ok: false, error: "Something went wrong on my end. Please try again." }, 500);
  }
  const [autoReply, notification] = await Promise.allSettled([
    sendAutoReply(env, lead, siteConfig.owner),
    sendOwnerNotification(env, lead)
  ]);
  const failures = [autoReply, notification].filter((r) => r.status === "rejected").map((r) => r.reason instanceof Error ? r.reason.message : String(r.reason));
  if (failures.length > 0) {
    console.error("booking: email delivery problem", failures);
    await setLeadEmailStatus(
      env.DB,
      lead.id,
      failures.length === 2 ? "failed" : "partial",
      failures.join(" | ")
    ).catch(() => void 0);
  } else {
    await setLeadEmailStatus(env.DB, lead.id, "sent", null).catch(() => void 0);
  }
  if (autoReply.status === "rejected") {
    return json(
      {
        ok: true,
        message: "Thank you — I have your enquiry and will be in touch by email shortly."
      },
      200
    );
  }
  return json(SUCCESS, 200);
};
const ALL = () => json({ ok: false, error: "Method not allowed." }, 405, { Allow: "POST" });

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	ALL,
	POST,
	prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
