import { describe, it, expect } from "vitest";
import { buildPdfFileName, getPartyRoleLabel } from "./pdfFileName";

describe("getPartyRoleLabel", () => {
  it("calls the client a seller and the partner a buyer for a sale", () => {
    expect(getPartyRoleLabel("client", "sale")).toBe("Pārdevējs");
    expect(getPartyRoleLabel("partner", "sale")).toBe("Pircējs");
  });

  it("calls the client a buyer and the partner a seller for a purchase", () => {
    expect(getPartyRoleLabel("client", "purchase")).toBe("Pircējs");
    expect(getPartyRoleLabel("partner", "purchase")).toBe("Pārdevējs");
  });

  it("calls the client a landlord and the partner a tenant for rent/lease", () => {
    expect(getPartyRoleLabel("client", "rent")).toBe("Izīrētājs");
    expect(getPartyRoleLabel("partner", "rent")).toBe("Nomnieks");
    expect(getPartyRoleLabel("client", "lease")).toBe("Izīrētājs");
    expect(getPartyRoleLabel("partner", "lease")).toBe("Nomnieks");
  });

  it("falls back to a generic label when dealType is missing/unknown", () => {
    expect(getPartyRoleLabel("client", undefined)).toBe("Klients");
    expect(getPartyRoleLabel("partner", undefined)).toBe("Darījuma partneris");
  });
});

describe("buildPdfFileName", () => {
  it("builds a filename from role, full name and address for an individual", () => {
    const fileName = buildPdfFileName({
      role: "client",
      dealType: "sale",
      address: "Rīga, Brīvības iela 1",
      firstName: "Jānis",
      lastName: "Bērziņš",
    });
    expect(fileName).toBe("Pardevejs_Janis_Berzins_Riga,_Brivibas_iela_1.pdf");
  });

  it("uses the company name for a legal entity (no firstName/lastName)", () => {
    const fileName = buildPdfFileName({
      role: "partner",
      dealType: "purchase",
      address: "Dārzciema iela 5, Rīga",
      companyName: 'SIA "Testa Klients"',
    });
    expect(fileName).toBe("Pardevejs_SIA_Testa_Klients_Darzciema_iela_5,_Riga.pdf");
  });

  it("strips double quotes from company names so they cannot break the Content-Disposition header", () => {
    const fileName = buildPdfFileName({ role: "client", companyName: 'SIA "Testa Klients"' });
    expect(fileName).not.toContain('"');
  });

  it("still produces a sane filename when name/address are missing (role always has a fallback label)", () => {
    expect(buildPdfFileName({})).toBe("Darijuma_partneris.pdf");
  });
});
