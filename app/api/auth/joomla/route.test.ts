import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { GET } from "./route";
import { sealToken } from "@/lib/hmacToken";
import { readSession, SESSION_COOKIE_NAME } from "@/lib/session";

const JOOMLA_SECRET = "0123456789abcdef0123456789abcdef";
const SESSION_SECRET = "fedcba9876543210fedcba9876543210";
const LOGIN_URL = "https://ekocentrs.lv/kyc-sso.php";

function handOffToken(overrides: Record<string, unknown> = {}) {
  const now = Math.floor(Date.now() / 1000);
  return sealToken(
    {
      sub: 42,
      name: "Jānis Bērziņš",
      email: "janis@ekocentrs.lv",
      iat: now,
      exp: now + 30,
      ...overrides,
    },
    JOOMLA_SECRET
  );
}

function request(token: string | null, { cookie = "", https = true } = {}) {
  const base = https ? "https://anketa.ekocentrs.lv" : "http://localhost:3000";
  const url = token === null ? `${base}/api/auth/joomla` : `${base}/api/auth/joomla?token=${encodeURIComponent(token)}`;

  return new Request(url, { headers: cookie ? { cookie } : {} });
}

function setCookies(response: Response): string[] {
  return response.headers.getSetCookie();
}

function cookieNamed(response: Response, name: string): string | undefined {
  return setCookies(response).find((value) => value.startsWith(`${name}=`));
}

beforeEach(() => {
  vi.stubEnv("AGENT_LOGIN", "joomla");
  vi.stubEnv("JOOMLA_SSO_SECRET", JOOMLA_SECRET);
  vi.stubEnv("SESSION_SECRET", SESSION_SECRET);
  vi.stubEnv("JOOMLA_LOGIN_URL", LOGIN_URL);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("GET /api/auth/joomla", () => {
  it("exchanges a valid hand-off token for a session and sends the agent to /izveidot", async () => {
    const response = await GET(request(await handOffToken()));

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://anketa.ekocentrs.lv/izveidot");

    const cookie = cookieNamed(response, SESSION_COOKIE_NAME);
    expect(cookie).toBeDefined();
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=lax");
    expect(cookie).toContain("Secure");
    expect(cookie).toContain("Path=/");
  });

  it("issues a session cookie that our own session reader accepts", async () => {
    const response = await GET(request(await handOffToken()));
    const value = cookieNamed(response, SESSION_COOKIE_NAME)!.split(";")[0].split("=")[1];

    expect(await readSession(decodeURIComponent(value), SESSION_SECRET)).toEqual({
      ok: true,
      agent: { id: 42, name: "Jānis Bērziņš", email: "janis@ekocentrs.lv" },
    });
  });

  it("omits Secure over plain http so local development works", async () => {
    const response = await GET(request(await handOffToken(), { https: false }));

    expect(cookieNamed(response, SESSION_COOKIE_NAME)).not.toContain("Secure");
  });

  it("sends an agent whose token went stale back to Joomla to log in again", async () => {
    const stale = await handOffToken({ iat: 1_700_000_000, exp: 1_700_000_030 });

    const response = await GET(request(stale));

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(LOGIN_URL);
    expect(cookieNamed(response, SESSION_COOKIE_NAME)).toBeUndefined();
  });

  it("stops instead of bouncing forever when the second attempt fails too", async () => {
    const stale = await handOffToken({ iat: 1_700_000_000, exp: 1_700_000_030 });
    const firstTry = await GET(request(stale));
    const retryCookie = cookieNamed(firstTry, "ekocentrs_sso_retry")!.split(";")[0];

    const response = await GET(request(stale, { cookie: retryCookie }));

    expect(response.status).toBe(401);
    expect(response.headers.get("location")).toBeNull();
    expect(cookieNamed(response, SESSION_COOKIE_NAME)).toBeUndefined();
  });

  it("treats a request with no token like a failed login", async () => {
    const response = await GET(request(null));

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(LOGIN_URL);
  });

  it("refuses a token signed with the wrong secret", async () => {
    const forged = await sealToken(
      { sub: 1, name: "Nezināms", email: "x@x.lv", iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 30 },
      "not-the-shared-secret-not-the-shared-secret"
    );

    const response = await GET(request(forged));

    expect(response.headers.get("location")).toBe(LOGIN_URL);
    expect(cookieNamed(response, SESSION_COOKIE_NAME)).toBeUndefined();
  });
});

describe("GET /api/auth/joomla when the app is not doing the login", () => {
  it("is not there at all", async () => {
    vi.stubEnv("AGENT_LOGIN", "external");

    const response = await GET(request(await handOffToken()));

    expect(response.status).toBe(404);
    expect(setCookies(response)).toEqual([]);
  });
});
