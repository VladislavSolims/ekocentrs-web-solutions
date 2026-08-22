/**
 * How the agent page is guarded, and everything that choice needs.
 *
 * Two ways to keep clients out of /izveidot:
 *
 *   external — something in front of the app does it (Cloudflare Access, an IP
 *              allowlist, HTTP auth on the web server). The app itself lets
 *              everyone through, because nothing else reaches it.
 *   joomla   — the app checks a signed hand-off from ekocentrs.lv itself, so
 *              agents log in with their existing Joomla password.
 *
 * Read through this function rather than reaching for process.env directly, so a
 * misconfigured deployment fails loudly at the first request instead of quietly
 * leaving the page open.
 */

/** Short secrets are cheap to brute-force; a `openssl rand -hex 32` value is 64 chars. */
const MIN_SECRET_LENGTH = 32;

export type AuthConfig =
  | { mode: "external" }
  | {
      mode: "joomla";
      /** Shared with kyc-sso.php on the Joomla side. */
      joomlaSecret: string;
      /** Ours alone — signs the agent's session cookie. */
      sessionSecret: string;
      /** Where an agent without a session is sent to log in. */
      joomlaLoginUrl: string;
    };

type Env = Record<string, string | undefined>;

function requireSecret(env: Env, key: string): string {
  const value = env[key];

  if (!value) {
    throw new Error(`${key} is not set — AGENT_LOGIN=joomla cannot work without it.`);
  }
  if (value.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `${key} is shorter than ${MIN_SECRET_LENGTH} characters. Generate one with: openssl rand -hex 32`
    );
  }

  return value;
}

function requireLoginUrl(env: Env, key: string): string {
  const value = env[key];

  if (!value) {
    throw new Error(`${key} is not set — agents would have nowhere to log in.`);
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${key} must be an absolute URL, for example https://ekocentrs.lv/kyc-sso.php`);
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error(`${key} must be an http(s) URL, got "${parsed.protocol}"`);
  }

  return value;
}

export function readAuthConfig(env: Env = process.env): AuthConfig {
  const mode = env.AGENT_LOGIN;

  if (mode === "external") return { mode: "external" };

  if (mode !== "joomla") {
    throw new Error(
      `AGENT_LOGIN must be "external" (something in front of the app guards /izveidot) ` +
        `or "joomla" (the app checks the hand-off itself), got ${JSON.stringify(mode)}. ` +
        `There is no default: guessing here could leave the agent page open.`
    );
  }

  const joomlaSecret = requireSecret(env, "JOOMLA_SSO_SECRET");
  const sessionSecret = requireSecret(env, "SESSION_SECRET");

  if (joomlaSecret === sessionSecret) {
    throw new Error(
      "JOOMLA_SSO_SECRET and SESSION_SECRET must be different — the Joomla side knows one of them."
    );
  }

  return {
    mode: "joomla",
    joomlaSecret,
    sessionSecret,
    joomlaLoginUrl: requireLoginUrl(env, "JOOMLA_LOGIN_URL"),
  };
}
