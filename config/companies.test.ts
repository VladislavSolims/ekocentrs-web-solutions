import { describe, it, expect } from "vitest";
import { COMPANIES } from "./companies";

describe("COMPANIES", () => {
  it("has the correct legal name and registration number for EKOCENTRS", () => {
    expect(COMPANIES.EKOCENTRS.legalName).toBe('SIA "EKOCENTRS"');
    expect(COMPANIES.EKOCENTRS.regNr).toBe("40003404760");
    expect(COMPANIES.EKOCENTRS.vatPayer).toBe(true);
  });

  it("has the correct legal name and registration number for SUN_RAIN", () => {
    expect(COMPANIES.SUN_RAIN.legalName).toBe('SIA "SUN RAIN"');
    expect(COMPANIES.SUN_RAIN.regNr).toBe("40103157437");
    expect(COMPANIES.SUN_RAIN.vatPayer).toBe(false);
  });
});
