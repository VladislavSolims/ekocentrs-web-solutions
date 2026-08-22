/**
 * Where ekocentrs.lv sends an agent after Joomla has confirmed who they are.
 *
 * The hand-off token is good for 30 seconds and is spent here: we check it and
 * swap it for our own session cookie. See docs/INTEGRACIJA.md for the Joomla side.
 */
import { NextResponse } from "next/server";
import { readAuthConfig } from "@/config/auth";
import { verifyJoomlaToken, type JoomlaTokenResult } from "@/lib/joomlaToken";
import { createSession, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/session";

export const runtime = "nodejs";

/**
 * A token can go stale for an innocent reason — the agent left the tab sitting.
 * The friendly answer is to send them back to Joomla, which will hand out a
 * fresh one. This cookie makes sure that happens at most once: if the second
 * attempt fails too (clocks out of step, wrong secret), something is actually
 * broken and we say so instead of bouncing the agent between two servers.
 */
const RETRY_COOKIE = "ekocentrs_sso_retry";
const RETRY_WINDOW_SECONDS = 60;

function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) return undefined;

  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }

  return undefined;
}

function loginFailedPage(reason: string): string {
  return `<!doctype html>
<html lang="lv">
  <head><meta charset="utf-8"><title>Pieteikšanās neizdevās</title></head>
  <body style="font-family: system-ui, sans-serif; max-width: 34rem; margin: 4rem auto; padding: 0 1rem; line-height: 1.6;">
    <h1 style="font-size: 1.4rem;">Pieteikšanās neizdevās</h1>
    <p>Neizdevās apstiprināt pieteikšanos no ekocentrs.lv. Pamēģiniet vēlreiz no vietnes izvēlnes.</p>
    <p>Ja tas atkārtojas, nododiet šo informāciju vietnes uzturētājam: <code>${reason}</code></p>
  </body>
</html>`;
}

export async function GET(request: Request): Promise<Response> {
  const config = readAuthConfig();

  // Nothing to hand off to: the login is happening in front of the app.
  if (config.mode === "external") {
    return new Response("Not found", { status: 404 });
  }

  const url = new URL(request.url);
  const secure = url.protocol === "https:";

  const token = url.searchParams.get("token");
  const result: JoomlaTokenResult = token
    ? await verifyJoomlaToken(token, config.joomlaSecret)
    : { ok: false, reason: "malformed" };

  if (!result.ok) {
    if (readCookie(request, RETRY_COOKIE) !== undefined) {
      const stop = new NextResponse(loginFailedPage(result.reason), {
        status: 401,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
      stop.cookies.delete(RETRY_COOKIE);
      return stop;
    }

    const retry = NextResponse.redirect(config.joomlaLoginUrl, 302);
    retry.cookies.set(RETRY_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: RETRY_WINDOW_SECONDS,
    });
    return retry;
  }

  const response = NextResponse.redirect(new URL("/izveidot", url), 302);
  response.cookies.set(
    SESSION_COOKIE_NAME,
    await createSession(result.agent, config.sessionSecret),
    {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    }
  );
  response.cookies.delete(RETRY_COOKIE);

  return response;
}
