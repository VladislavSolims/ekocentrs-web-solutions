import { describe, it, expect } from "vitest";
import { createHmac } from "node:crypto";
import { verifyJoomlaToken, TOKEN_MAX_AGE_SECONDS } from "./joomlaToken";

const SECRET = "0123456789abcdef0123456789abcdef";
const NOW = 1_770_000_000; // fixed "current time" in seconds

/**
 * Builds a token exactly the way kyc-sso.php does on the Joomla side:
 * base64url(JSON payload) + "." + hex HMAC-SHA256 of that base64url string.
 */
function joomlaToken(payload: Record<string, unknown>, secret = SECRET): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const signature = createHmac("sha256", secret).update(body).digest("hex");
  return `${body}.${signature}`;
}

function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    sub: 42,
    name: "Jānis Bērziņš",
    email: "janis@ekocentrs.lv",
    iat: NOW,
    exp: NOW + TOKEN_MAX_AGE_SECONDS,
    jti: "8f14e45fceea167a5a36dedd4bea2543",
    ...overrides,
  };
}

describe("verifyJoomlaToken", () => {
  it("accepts a token signed with the shared secret and returns the agent", async () => {
    const result = await verifyJoomlaToken(joomlaToken(validPayload()), SECRET, NOW);

    expect(result).toEqual({
      ok: true,
      agent: { id: 42, name: "Jānis Bērziņš", email: "janis@ekocentrs.lv" },
    });
  });

  it("rejects a token signed with a different secret", async () => {
    const token = joomlaToken(validPayload(), "a-completely-different-secret");

    expect(await verifyJoomlaToken(token, SECRET, NOW)).toEqual({
      ok: false,
      reason: "bad-signature",
    });
  });

  it("rejects a token whose payload was tampered with after signing", async () => {
    const [body, signature] = joomlaToken(validPayload()).split(".");
    const forged = Buffer.from(JSON.stringify(validPayload({ sub: 1 })), "utf8")
      .toString("base64url");

    expect(body).not.toBe(forged);
    expect(await verifyJoomlaToken(`${forged}.${signature}`, SECRET, NOW)).toEqual({
      ok: false,
      reason: "bad-signature",
    });
  });

  it("rejects tokens that are not two dot-separated parts", async () => {
    for (const token of ["", ".", "no-dot-at-all", "body.", ".signature", "a.b.c"]) {
      expect(await verifyJoomlaToken(token, SECRET, NOW)).toEqual({
        ok: false,
        reason: "malformed",
      });
    }
  });

  it("rejects a correctly signed body that is not a valid payload", async () => {
    const notJson = Buffer.from("hello", "utf8").toString("base64url");
    const signature = createHmac("sha256", SECRET).update(notJson).digest("hex");

    expect(await verifyJoomlaToken(`${notJson}.${signature}`, SECRET, NOW)).toEqual({
      ok: false,
      reason: "bad-payload",
    });

    const missingEmail = joomlaToken({ sub: 42, name: "Jānis", iat: NOW, exp: NOW + 30 });
    expect(await verifyJoomlaToken(missingEmail, SECRET, NOW)).toEqual({
      ok: false,
      reason: "bad-payload",
    });
  });

  it("rejects a token that has expired", async () => {
    const token = joomlaToken(validPayload({ iat: NOW - 60, exp: NOW - 30 }));

    expect(await verifyJoomlaToken(token, SECRET, NOW)).toEqual({
      ok: false,
      reason: "expired",
    });
  });

  it("enforces our own maximum lifetime even if Joomla asks for a longer one", async () => {
    const overlyGenerous = joomlaToken(
      validPayload({ iat: NOW - TOKEN_MAX_AGE_SECONDS - 1, exp: NOW + 86_400 })
    );

    expect(await verifyJoomlaToken(overlyGenerous, SECRET, NOW)).toEqual({
      ok: false,
      reason: "expired",
    });
  });

  it("rejects a token issued far in the future", async () => {
    const token = joomlaToken(validPayload({ iat: NOW + 3600, exp: NOW + 3660 }));

    expect(await verifyJoomlaToken(token, SECRET, NOW)).toEqual({
      ok: false,
      reason: "not-yet-valid",
    });
  });

  it("tolerates a small clock difference between the two servers", async () => {
    const token = joomlaToken(validPayload({ iat: NOW + 5, exp: NOW + 35 }));

    expect(await verifyJoomlaToken(token, SECRET, NOW)).toMatchObject({ ok: true });
  });
});
