/**
 * Verification of the short-lived token issued by the Joomla side.
 *
 * ekocentrs.lv (Joomla 3.10) hands an already-logged-in agent a token built by
 * `kyc-sso.php` in the format described in lib/hmacToken.ts. We never see the
 * agent's password — we only check that the token carries our shared secret's
 * signature and is fresh.
 *
 * Nothing is stored, so a token cannot be marked as used. Freshness is the whole
 * defence: we cap the lifetime ourselves rather than trusting the `exp` the
 * Joomla side asks for, so a misconfigured bridge cannot mint a long-lived pass.
 */
import { openToken } from "./hmacToken";

/** How long a token stays usable, counted from when Joomla issued it. */
export const TOKEN_MAX_AGE_SECONDS = 30;

/** Allowance for the two servers' clocks not being perfectly in step. */
export const CLOCK_SKEW_SECONDS = 30;

export type JoomlaAgent = {
  id: number;
  name: string;
  email: string;
};

export type JoomlaTokenFailure =
  | "malformed"
  | "bad-signature"
  | "bad-payload"
  | "expired"
  | "not-yet-valid";

export type JoomlaTokenResult =
  | { ok: true; agent: JoomlaAgent }
  | { ok: false; reason: JoomlaTokenFailure };

type TokenPayload = {
  agent: JoomlaAgent;
  issuedAt: number;
  expiresAt: number;
};

function failure(reason: JoomlaTokenFailure): JoomlaTokenResult {
  return { ok: false, reason };
}

function readPayload(json: string): TokenPayload | null {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return null;
  }

  if (typeof raw !== "object" || raw === null) return null;
  const { sub, name, email, iat, exp } = raw as Record<string, unknown>;

  if (typeof sub !== "number" || !Number.isInteger(sub) || sub <= 0) return null;
  if (typeof name !== "string" || name.trim() === "") return null;
  if (typeof email !== "string" || email.trim() === "") return null;
  if (typeof iat !== "number" || !Number.isFinite(iat)) return null;
  if (typeof exp !== "number" || !Number.isFinite(exp)) return null;

  return {
    agent: { id: sub, name, email },
    issuedAt: iat,
    expiresAt: exp,
  };
}

/**
 * @param nowSeconds current time in seconds — injectable so tests are not clock-dependent.
 */
export async function verifyJoomlaToken(
  token: string,
  secret: string,
  nowSeconds: number = Math.floor(Date.now() / 1000)
): Promise<JoomlaTokenResult> {
  const opened = await openToken(token, secret);
  if (!opened.ok) return failure(opened.reason);

  const payload = readPayload(opened.json);
  if (payload === null) return failure("bad-payload");

  if (payload.issuedAt > nowSeconds + CLOCK_SKEW_SECONDS) {
    return failure("not-yet-valid");
  }

  // Our cap wins over whatever expiry the bridge asked for.
  const expiresAt = Math.min(payload.expiresAt, payload.issuedAt + TOKEN_MAX_AGE_SECONDS);
  if (nowSeconds >= expiresAt) return failure("expired");

  return { ok: true, agent: payload.agent };
}
