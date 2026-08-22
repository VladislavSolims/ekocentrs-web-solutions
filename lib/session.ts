/**
 * The agent's own session, held in a signed cookie.
 *
 * The token from Joomla lives 30 seconds and is spent immediately; this is what
 * keeps the agent logged in afterwards. Same wire format (lib/hmacToken.ts), but
 * a different secret and a `typ` marker, so neither kind of token can be passed
 * off as the other.
 *
 * Still nothing on the server: the cookie carries the agent, and its signature
 * is what makes it trustworthy.
 */
import { openToken, sealToken } from "./hmacToken";
import type { JoomlaAgent } from "./joomlaToken";

export const SESSION_COOKIE_NAME = "ekocentrs_agent";

/** A working day, so an agent logs in through Joomla once each morning. */
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

/** Marks this token as a session, never a Joomla hand-off token. */
const SESSION_TYPE = "agent-session";

export type SessionFailure =
  | "missing"
  | "malformed"
  | "bad-signature"
  | "bad-payload"
  | "expired";

export type SessionResult =
  | { ok: true; agent: JoomlaAgent }
  | { ok: false; reason: SessionFailure };

export async function createSession(
  agent: JoomlaAgent,
  secret: string,
  nowSeconds: number = Math.floor(Date.now() / 1000)
): Promise<string> {
  return sealToken(
    {
      typ: SESSION_TYPE,
      sub: agent.id,
      name: agent.name,
      email: agent.email,
      iat: nowSeconds,
      exp: nowSeconds + SESSION_MAX_AGE_SECONDS,
    },
    secret
  );
}

export async function readSession(
  cookie: string | undefined,
  secret: string,
  nowSeconds: number = Math.floor(Date.now() / 1000)
): Promise<SessionResult> {
  if (!cookie) return { ok: false, reason: "missing" };

  const opened = await openToken(cookie, secret);
  if (!opened.ok) return { ok: false, reason: opened.reason };

  let raw: unknown;
  try {
    raw = JSON.parse(opened.json);
  } catch {
    return { ok: false, reason: "bad-payload" };
  }

  if (typeof raw !== "object" || raw === null) return { ok: false, reason: "bad-payload" };
  const { typ, sub, name, email, exp } = raw as Record<string, unknown>;

  if (typ !== SESSION_TYPE) return { ok: false, reason: "bad-payload" };
  if (typeof sub !== "number" || !Number.isInteger(sub) || sub <= 0) {
    return { ok: false, reason: "bad-payload" };
  }
  if (typeof name !== "string" || name === "") return { ok: false, reason: "bad-payload" };
  if (typeof email !== "string" || email === "") return { ok: false, reason: "bad-payload" };
  if (typeof exp !== "number" || !Number.isFinite(exp)) {
    return { ok: false, reason: "bad-payload" };
  }

  if (nowSeconds >= exp) return { ok: false, reason: "expired" };

  return { ok: true, agent: { id: sub, name, email } };
}
