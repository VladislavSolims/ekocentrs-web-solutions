import { describe, it, expect } from "vitest";
import { getDocumentTitle } from "./documentTitle";

describe("getDocumentTitle", () => {
  it("returns the client title for role 'client'", () => {
    expect(getDocumentTitle("client")).toBe("Klienta identifikācijas un izpētes anketa");
  });

  it("returns the partner title for role 'partner'", () => {
    expect(getDocumentTitle("partner")).toBe(
      "Klienta darījuma partnera identifikācijas un izpētes anketa"
    );
  });

  it("falls back to the client title when role is missing or invalid", () => {
    expect(getDocumentTitle(undefined)).toBe("Klienta identifikācijas un izpētes anketa");
    expect(getDocumentTitle("something-else")).toBe("Klienta identifikācijas un izpētes anketa");
  });
});
