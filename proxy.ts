/**
 * Guards the agent-only page.
 *
 * In Next.js 16 this file convention is `proxy.ts`; `middleware.ts` is the
 * deprecated name for the same thing.
 *
 * Only `/izveidot` is protected. The client questionnaire (`/aizpildit?d=…`)
 * stays open on purpose — a client fills it in once, from a link, and should
 * never need an account.
 */
import { NextResponse, type NextRequest } from "next/server";
import { readAuthConfig } from "@/config/auth";
import { readSession, SESSION_COOKIE_NAME } from "@/lib/session";

export const config = {
  matcher: ["/izveidot", "/izveidot/:path*"],
};

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const auth = readAuthConfig();
  const session = await readSession(
    request.cookies.get(SESSION_COOKIE_NAME)?.value,
    auth.sessionSecret
  );

  if (session.ok) return NextResponse.next();

  // Joomla decides who may log in; we only know that this visitor may not pass.
  return NextResponse.redirect(auth.joomlaLoginUrl);
}
