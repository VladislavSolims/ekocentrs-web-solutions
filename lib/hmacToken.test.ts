import { describe, it, expect } from "vitest";
import { createHmac } from "node:crypto";
import { sealToken, openToken } from "./hmacToken";

const SECRET = "0123456789abcdef0123456789abcdef";

describe("sealToken / openToken", () => {
  it("produces the same format kyc-sso.php produces", async () => {
    const payload = { sub: 42, name: "Jānis Bērziņš" };
    const token = await sealToken(payload, SECRET);
    const [body, signature] = token.split(".");

    // What PHP would have written for the same body.
    expect(signature).toBe(createHmac("sha256", SECRET).update(body).digest("hex"));
    expect(Buffer.from(body, "base64url").toString("utf8")).toBe(JSON.stringify(payload));
    expect(body).not.toMatch(/[+/=]/); // base64url, safe to put in a URL
  });

  it("opens a token it sealed itself", async () => {
    const token = await sealToken({ hello: "pasaule" }, SECRET);

    expect(await openToken(token, SECRET)).toEqual({
      ok: true,
      json: JSON.stringify({ hello: "pasaule" }),
    });
  });

  it("refuses a token sealed with another secret", async () => {
    const token = await sealToken({ hello: "pasaule" }, "another-secret");

    expect(await openToken(token, SECRET)).toEqual({ ok: false, reason: "bad-signature" });
  });

  it("refuses tokens that are not two dot-separated parts", async () => {
    for (const token of ["", ".", "nodot", "body.", ".sig", "a.b.c"]) {
      expect(await openToken(token, SECRET)).toEqual({ ok: false, reason: "malformed" });
    }
  });

  it("refuses a correctly signed body that is not decodable text", async () => {
    const body = "%%%not-base64%%%";
    const signature = createHmac("sha256", SECRET).update(body).digest("hex");

    expect(await openToken(`${body}.${signature}`, SECRET)).toEqual({
      ok: false,
      reason: "bad-payload",
    });
  });

  it("survives a round trip with Latvian diacritics", async () => {
    const payload = { name: "Ģirts Šķēle", city: "Liepāja" };
    const opened = await openToken(await sealToken(payload, SECRET), SECRET);

    expect(opened).toEqual({ ok: true, json: JSON.stringify(payload) });
  });
});
