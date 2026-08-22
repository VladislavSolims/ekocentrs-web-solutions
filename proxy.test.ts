import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "./proxy";
import { createSession, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/session";

const SESSION_SECRET = "fedcba9876543210fedcba9876543210";
const LOGIN_URL = "https://ekocentrs.lv/kyc-sso.php";

const agent = { id: 42, name: "Jānis Bērziņš", email: "janis@ekocentrs.lv" };

function requestWith(cookieValue?: string) {
  return new NextRequest("https://anketa.ekocentrs.lv/izveidot", {
    headers: cookieValue ? { cookie: `${SESSION_COOKIE_NAME}=${cookieValue}` } : {},
  });
}

beforeEach(() => {
  vi.stubEnv("AGENT_LOGIN", "joomla");
  vi.stubEnv("JOOMLA_SSO_SECRET", "0123456789abcdef0123456789abcdef");
  vi.stubEnv("SESSION_SECRET", SESSION_SECRET);
  vi.stubEnv("JOOMLA_LOGIN_URL", LOGIN_URL);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("proxy guarding /izveidot", () => {
  it("lets an agent with a valid session through", async () => {
    const response = await proxy(requestWith(await createSession(agent, SESSION_SECRET)));

    expect(response.headers.get("location")).toBeNull();
  });

  it("sends a visitor without a session to Joomla to log in", async () => {
    const response = await proxy(requestWith());

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(LOGIN_URL);
  });

  it("sends an agent whose session has run out back to Joomla", async () => {
    const longExpired = await createSession(
      agent,
      SESSION_SECRET,
      Math.floor(Date.now() / 1000) - SESSION_MAX_AGE_SECONDS - 1
    );

    const response = await proxy(requestWith(longExpired));

    expect(response.headers.get("location")).toBe(LOGIN_URL);
  });

  it("does not accept a session cookie signed with another secret", async () => {
    const forged = await createSession(agent, "an-attackers-secret-an-attackers-secret");

    const response = await proxy(requestWith(forged));

    expect(response.headers.get("location")).toBe(LOGIN_URL);
  });
});

describe("proxy when the guard sits in front of the app", () => {
  it("lets everyone through, because nothing else reaches it", async () => {
    vi.stubEnv("AGENT_LOGIN", "external");

    const response = await proxy(requestWith());

    expect(response.headers.get("location")).toBeNull();
  });
});
