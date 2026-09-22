globalThis.process ??= {}; globalThis.process.env ??= {};
import { b as buildAuthUrl, r as redirectUriFor } from '../../../../chunks/google_Bl6EIWms.mjs';
import { e as setStateCookie } from '../../../../chunks/session_BEjCJbxK.mjs';
export { renderers } from '../../../../renderers.mjs';

const prerender = false;
function safeNext(raw) {
  if (raw === null) return "/admin";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/admin";
  return raw;
}
const GET = ({ url, cookies, locals, redirect }) => {
  const env = locals.runtime.env;
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return new Response(
      "Google sign-in is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
      { status: 500, headers: { "Content-Type": "text/plain" } }
    );
  }
  const nonce = crypto.randomUUID();
  const state = `${nonce}:${safeNext(url.searchParams.get("next"))}`;
  setStateCookie(cookies, url, state);
  return redirect(buildAuthUrl(env, redirectUriFor(url), state), 302);
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	GET,
	prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
