import { createHmac } from "node:crypto";
import type { Page } from "@playwright/test";

/**
 * Secrets used only when the E2E suite starts the dev server (see
 * playwright.config.ts) and in .env.local for local development. Real values
 * live in the deployment environment — see .env.example.
 */
export const E2E_JOOMLA_SECRET = "e2e-joomla-sso-secret-0123456789abcdef";
export const E2E_SESSION_SECRET = "e2e-session-secret-fedcba9876543210ab";
export const E2E_JOOMLA_LOGIN_URL = "http://localhost:3000/joomla-login-stub";

/** Builds a hand-off token the way kyc-sso.php does on the Joomla side. */
export function joomlaHandOffToken(secret: string = E2E_JOOMLA_SECRET): string {
  const now = Math.floor(Date.now() / 1000);
  const body = Buffer.from(
    JSON.stringify({
      sub: 7,
      name: "E2E Aģents",
      email: "agents@ekocentrs.lv",
      iat: now,
      exp: now + 30,
      jti: "e2e00000000000000000000000000000",
    }),
    "utf8"
  ).toString("base64url");

  return `${body}.${createHmac("sha256", secret).update(body).digest("hex")}`;
}

/**
 * Logs in the way a real agent does: Joomla has already checked the password,
 * and hands us a signed token. Going through the real endpoint means the E2E
 * suite exercises the login instead of stepping around it.
 */
export async function loginAsAgent(page: Page): Promise<void> {
  await page.goto(`/api/auth/joomla?token=${encodeURIComponent(joomlaHandOffToken())}`);
  await page.waitForURL("**/izveidot");
}
