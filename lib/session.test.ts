import { describe, it, expect } from "vitest";
import { createSession, readSession, SESSION_MAX_AGE_SECONDS } from "./session";
import { sealToken } from "./hmacToken";

const SECRET = "fedcba9876543210fedcba9876543210";
const NOW = 1_770_000_000;

const agent = { id: 42, name: "Jānis Bērziņš", email: "janis@ekocentrs.lv" };

describe("agent session cookie", () => {
  it("reads back the agent it was created for", async () => {
    const cookie = await createSession(agent, SECRET, NOW);

    expect(await readSession(cookie, SECRET, NOW)).toEqual({ ok: true, agent });
  });

  it("stays valid for the whole session lifetime and not a second longer", async () => {
    const cookie = await createSession(agent, SECRET, NOW);
    const lastValid = NOW + SESSION_MAX_AGE_SECONDS - 1;

    expect(await readSession(cookie, SECRET, lastValid)).toMatchObject({ ok: true });
    expect(await readSession(cookie, SECRET, lastValid + 1)).toEqual({
      ok: false,
      reason: "expired",
    });
  });

  it("treats a missing cookie as no session rather than an error", async () => {
    expect(await readSession(undefined, SECRET, NOW)).toEqual({ ok: false, reason: "missing" });
    expect(await readSession("", SECRET, NOW)).toEqual({ ok: false, reason: "missing" });
  });

  it("refuses a cookie signed with another secret", async () => {
    const forged = await createSession(agent, "an-attackers-secret", NOW);

    expect(await readSession(forged, SECRET, NOW)).toEqual({
      ok: false,
      reason: "bad-signature",
    });
  });

  it("refuses a Joomla hand-off token replayed as a session cookie", async () => {
    // Same wire format, so if the two secrets were ever set to the same value a
    // 30-second hand-off token must still not buy an 8-hour session.
    const handoff = await sealToken(
      { sub: 42, name: agent.name, email: agent.email, iat: NOW, exp: NOW + 30 },
      SECRET
    );

    expect(await readSession(handoff, SECRET, NOW)).toEqual({
      ok: false,
      reason: "bad-payload",
    });
  });
});
