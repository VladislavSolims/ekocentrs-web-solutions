import { describe, it, expect } from "vitest";
import { legalSchema } from "./legalSchema";
import { getAllFieldIds, getField } from "./types";

describe("legalSchema structure", () => {
  it("has no duplicate field ids across steps", () => {
    const ids = getAllFieldIds(legalSchema);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("contains every field expected from the source document (3_JUR_...docx)", () => {
    const expectedIds = [
      // client identity
      "companyName", "registrationNumberAndDate", "legalAddress", "actualBusinessAddress",
      "website", "issuesBearerShares",
      // representative
      "representativeFullNameAndCode", "representativeBirthDate", "representativeIdDocumentInfo",
      "representativePosition", "representativeContact",
      // economic activity
      "businessActivity", "naceCode", "activityJurisdictions", "licenseRequired",
      "averageAnnualTurnover", "cashTurnoverShare", "sourceOfFunds", "sourceOfFundsOther",
      "militaryGoodsConnection", "militaryGoodsCode",
      "sanctionsRegulationExposure", "sanctionsRegulationDescription",
      // sanctions screening
      "sanctionedPersonsConnection", "sanctionedPersonsDescription",
      // beneficial owner (PLG)
      "beneficialOwnerFullName", "beneficialOwnerPersonalCode", "beneficialOwnerBirthDate",
      "beneficialOwnerIdDocumentInfo", "beneficialOwnerNationality", "beneficialOwnerResidenceCountry",
      "beneficialOwnerControlShare", "beneficialOwnerSanctionsConnection", "beneficialOwnerSanctionsDescription",
      // indirect control
      "indirectControlType", "indirectControlNaturalPersonName", "indirectControlNaturalPersonCode",
      "indirectControlLegalEntityName", "indirectControlLegalEntityRegNr", "indirectControlLegalEntityAddress",
      "indirectControlAuthorizedPersonName", "indirectControlAuthorizedPersonCode",
      // deal terms
      "relationshipPurpose", "purchaseSaleAmountBracket", "purchaseSaleAmountDescription",
      "rentLeaseAmountBracket", "rentLeaseAmountDescription",
      "paymentInstitutions", "paymentInstitutionsEuCountry", "paymentInstitutionsThirdCountry",
      // declarations
      "beneficialOwnerPepStatus", "beneficialOwnerPepDescription",
      "criminalRecordRepresentativeAndOwner", "criminalRecordRepresentativeAndOwnerJustification",
      "sanctionsCountryConnection", "sanctionsCountryDescription",
      "criminalRecord", "criminalRecordJustification",
      "sanctionsComplianceCommitment", "truthfulInfoCommitment",
      // gdpr + signature
      "dataProcessingConsent1", "dataProcessingConsent2", "dataProcessingConsent3",
      "signingMethod", "signatureName", "signatureDate",
    ];

    const actualIds = getAllFieldIds(legalSchema);
    for (const id of expectedIds) {
      expect(actualIds, `missing field "${id}"`).toContain(id);
    }
  });
});

describe("legalSchema conditional visibility", () => {
  it("shows the license-copy note only when a license is required", () => {
    const field = getField(legalSchema, "licenseRequired")!;
    expect(field).toBeDefined();
    expect(field.options?.map((o) => o.value)).toEqual(["yes", "no"]);
  });

  it("shows the TARIC code field only when military goods connection is yes", () => {
    const field = getField(legalSchema, "militaryGoodsCode")!;
    expect(field.visibleIf!({ militaryGoodsConnection: "no" })).toBe(false);
    expect(field.visibleIf!({ militaryGoodsConnection: "yes" })).toBe(true);
  });

  it("shows the beneficial owner PEP description only when status indicates PEP", () => {
    const field = getField(legalSchema, "beneficialOwnerPepDescription")!;
    expect(field.visibleIf!({ beneficialOwnerPepStatus: "is_pep" })).toBe(true);
    expect(field.visibleIf!({ beneficialOwnerPepStatus: "not_pep" })).toBe(false);
  });

  it("shows the indirect-control natural person fields only when control type is natural_person", () => {
    const field = getField(legalSchema, "indirectControlNaturalPersonName")!;
    expect(field.visibleIf!({ indirectControlType: "natural_person" })).toBe(true);
    expect(field.visibleIf!({ indirectControlType: "legal_entity" })).toBe(false);
  });

  it("shows the indirect-control legal entity fields only when control type is legal_entity", () => {
    const field = getField(legalSchema, "indirectControlLegalEntityName")!;
    expect(field.visibleIf!({ indirectControlType: "legal_entity" })).toBe(true);
    expect(field.visibleIf!({ indirectControlType: "natural_person" })).toBe(false);
  });

  it("asks for the typed signature name only when signing electronically", () => {
    const field = getField(legalSchema, "signatureName")!;
    expect(field.visibleIf!({ signingMethod: "electronic" })).toBe(true);
    expect(field.visibleIf!({ signingMethod: "handwritten" })).toBe(false);
  });

  it("shows the purchase/sale amount bracket only for sale or purchase deals", () => {
    const field = getField(legalSchema, "purchaseSaleAmountBracket")!;
    expect(field.visibleIf!({ dealType: "purchase" })).toBe(true);
    expect(field.visibleIf!({ dealType: "rent" })).toBe(false);
  });

  it("shows the sanctions country description only when there is a sanctions country connection", () => {
    const field = getField(legalSchema, "sanctionsCountryDescription")!;
    expect(field.visibleIf!({ sanctionsCountryConnection: "yes" })).toBe(true);
    expect(field.visibleIf!({ sanctionsCountryConnection: "no" })).toBe(false);
  });
});
