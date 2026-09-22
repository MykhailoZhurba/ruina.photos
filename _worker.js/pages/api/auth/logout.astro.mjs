globalThis.process ??= {}; globalThis.process.env ??= {};
import { i as isSameOrigin, f as cookieNames, g as deleteSession, h as clearSessionCookie } from '../../../chunks/session_BEjCJbxK.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const POST = async ({ request, url, cookies, locals, redirect }) => {
  if (!isSameOrigin(request, url)) {
    return new Response("Cross-origin request rejected.", { status: 403 });
  }
  const id = cookies.get(cookieNames(url).session)?.value;
  if (id) {
    await deleteSession(locals.runtime.env.DB, id).catch(() => void 0);
  }
  clearSessionCookie(cookies, url);
  return redirect("/", 302);
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	POST,
	prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
