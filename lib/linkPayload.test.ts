import { describe, it, expect } from "vitest";
import { encodeLinkPayload, decodeLinkPayload, type LinkPayload } from "./linkPayload";

describe("linkPayload", () => {
  const examplePayload: LinkPayload = {
    v: 1,
    clientType: "individual",
    company: "EKOCENTRS",
    address: "Rīga, Brīvības iela 1",
    dealType: "sale",
    role: "client",
  };

  it("round-trips a payload through encode and decode", () => {
    const encoded = encodeLinkPayload(examplePayload);
    const decoded = decodeLinkPayload(encoded);
    expect(decoded).toEqual(examplePayload);
  });

  it("produces a URL-safe string (no characters that need escaping in a query param)", () => {
    const encoded = encodeLinkPayload(examplePayload);
    expect(encoded).toMatch(/^[A-Za-z0-9+-]+$/);
  });

  it("throws a clear error when decoding garbage input instead of crashing silently", () => {
    expect(() => decodeLinkPayload("not-a-real-payload")).toThrow();
  });

  it("throws when the decoded payload doesn't match the expected shape", () => {
    const encodedButInvalid = encodeLinkPayload({
      v: 1,
      clientType: "not-a-real-type",
    } as unknown as LinkPayload);
    expect(() => decodeLinkPayload(encodedButInvalid)).toThrow();
  });
});
