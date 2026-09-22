globalThis.process ??= {}; globalThis.process.env ??= {};
import { e as exchangeCode, r as redirectUriFor, a as emailFromIdToken, s as storeTokens } from '../../../../chunks/google_Bl6EIWms.mjs';
import { r as readStateCookie, a as clearStateCookie, b as isAllowedAdmin, d as createSession, s as setSessionCookie } from '../../../../chunks/session_BEjCJbxK.mjs';
export { renderers } from '../../../../renderers.mjs';

const prerender = false;
function message(title, body, status) {
  return new Response(
    `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width" />
<meta name="robots" content="noindex,nofollow" />
<title>${title}</title></head>
<body style="margin:0;display:grid;place-items:center;min-height:100vh;font-family:system-ui,sans-serif;color:#111;background:#fafafa;">
<main style="max-width:32rem;padding:2rem;text-align:center;">
<h1 style="font-size:1.25rem;margin:0 0 .75rem;">${title}</h1>
<p style="margin:0 0 1.5rem;color:#555;line-height:1.5;">${body}</p>
<a href="/" style="color:#111;">Back to the site</a>
</main></body></html>`,
    {
      status,
      headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex, nofollow" }
    }
  );
}
const GET = async ({ url, cookies, locals, redirect }) => {
  const env = locals.runtime.env;
  const error = url.searchParams.get("error");
  if (error !== null) {
    return message("Sign-in cancelled", "You did not finish signing in with Google.", 400);
  }
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const expectedState = readStateCookie(cookies, url);
  clearStateCookie(cookies, url);
  if (code === null || returnedState === null || expectedState === void 0) {
    return message("Sign-in failed", "The sign-in request was incomplete. Please try again.", 400);
  }
  if (returnedState !== expectedState) {
    return message(
      "Sign-in failed",
      "That sign-in link did not originate from this site. Please try again.",
      400
    );
  }
  let tokens;
  try {
    tokens = await exchangeCode(env, code, redirectUriFor(url));
  } catch (cause) {
    console.error("auth: code exchange failed", cause);
    return message("Sign-in failed", "Google rejected the sign-in. Please try again.", 502);
  }
  if (!tokens.id_token) {
    return message("Sign-in failed", "Google did not return an identity token.", 502);
  }
  const email = emailFromIdToken(tokens.id_token, env.GOOGLE_CLIENT_ID);
  if (email === null) {
    return message("Sign-in failed", "The identity token from Google was not valid.", 502);
  }
  if (!isAllowedAdmin(email, env.ADMIN_EMAILS ?? "")) {
    return message(
      "Not authorised",
      `${email} is not on the admin list for this site. Sign in with the account that owns the calendar.`,
      403
    );
  }
  try {
    await storeTokens(env.DB, email, {
      refreshToken: tokens.refresh_token,
      accessToken: tokens.access_token,
      expiresIn: tokens.expires_in
    });
    const sessionId = await createSession(env.DB, email);
    setSessionCookie(cookies, url, sessionId);
  } catch (cause) {
    console.error("auth: failed to persist session", cause);
    return message("Sign-in failed", "Could not start your session. Please try again.", 500);
  }
  const destination = expectedState.slice(expectedState.indexOf(":") + 1) || "/admin";
  return redirect(destination, 302);
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	GET,
	prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
