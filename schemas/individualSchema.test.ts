import { describe, it, expect } from "vitest";
import { individualSchema } from "./individualSchema";
import { getAllFieldIds, getField } from "./types";

describe("individualSchema structure", () => {
  it("has no duplicate field ids across steps", () => {
    const ids = getAllFieldIds(individualSchema);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("contains every field expected from the source document (1_F_...docx)", () => {
    const expectedIds = [
      // personal info
      "firstName", "lastName", "personalCode", "birthDate", "contactPhone",
      "contactEmail", "birthPlace", "nationality", "residenceCountry",
      "idDocumentType", "idDocumentNumber", "idDocumentIssueDate",
      "idDocumentExpiryDate", "idDocumentIssuingCountry", "idDocumentIssuingAuthority",
      "residencePermitType", "residencePermitDocumentInfo",
      // economic activity & source of funds
      "socialStatus", "socialStatusOther", "employerName", "employerPosition",
      "businessActivityType", "businessActivityTypeOther",
      "militaryGoodsConnection", "militaryGoodsCode",
      "sanctionsRegulationExposure", "sanctionsRegulationDescription",
      "sourceOfFunds", "sourceOfFundsOther", "activityJurisdictions",
      "averageAnnualIncome", "cashIncomeShare",
      // sanctions screening
      "sanctionedPersonsConnection", "sanctionedPersonsDescription",
      // deal terms
      "relationshipPurpose", "purchaseSaleAmountBracket", "purchaseSaleAmountDescription",
      "rentLeaseAmountBracket", "rentLeaseAmountDescription",
      "paymentInstitutions", "paymentInstitutionsEuCountry", "paymentInstitutionsThirdCountry",
      // declarations
      "soleBeneficialOwnerConfirmation", "isPep", "pepDescription",
      "criminalRecord", "criminalRecordJustification",
      "sanctionsComplianceCommitment", "truthfulInfoCommitment",
      // authorized person (conditional block)
      "actingOnBehalfOfAnother", "authorizedPersonType", "authorizedPersonTypeOther",
      "authorizedPersonFullName", "authorizedPersonalCode", "authorizedBirthInfo",
      "authorizedAddress", "authorizedPhone", "authorizedEmail",
      "authorizedIdDocumentType", "authorizedIdDocumentNumber",
      "authorizedIdDocumentIssueDate", "authorizedIdDocumentExpiryDate",
      "authorizedIdDocumentIssuingCountry", "authorizedIdDocumentIssuingAuthority",
      "authorizedResidencePermitType", "authorizedResidencePermitDocumentInfo",
      "authorizationType", "authorizationBasis",
      // gdpr + signature
      "dataProcessingConsent1", "dataProcessingConsent2", "dataProcessingConsent3",
      "signingMethod", "signatureName", "signatureDate",
    ];

    const actualIds = getAllFieldIds(individualSchema);
    for (const id of expectedIds) {
      expect(actualIds, `missing field "${id}"`).toContain(id);
    }
  });
});

describe("individualSchema conditional visibility", () => {
  it("hides foreign-ID-document fields when a Latvian personal code is given", () => {
    const field = getField(individualSchema, "idDocumentNumber")!;
    expect(field.visibleIf!({ personalCode: "123456-12345" })).toBe(false);
    expect(field.visibleIf!({ personalCode: "" })).toBe(true);
  });

  it("shows the TARIC code field only when military goods connection is yes", () => {
    const field = getField(individualSchema, "militaryGoodsCode")!;
    expect(field.visibleIf!({ militaryGoodsConnection: "no" })).toBe(false);
    expect(field.visibleIf!({ militaryGoodsConnection: "yes" })).toBe(true);
  });

  it("shows the sanctions regulation description only when exposure is yes", () => {
    const field = getField(individualSchema, "sanctionsRegulationDescription")!;
    expect(field.visibleIf!({ sanctionsRegulationExposure: "yes" })).toBe(true);
    expect(field.visibleIf!({ sanctionsRegulationExposure: "no" })).toBe(false);
    expect(field.visibleIf!({ sanctionsRegulationExposure: "hard_to_say" })).toBe(false);
  });

  it("shows the PEP description only when isPep is yes", () => {
    const field = getField(individualSchema, "pepDescription")!;
    expect(field.visibleIf!({ isPep: "yes" })).toBe(true);
    expect(field.visibleIf!({ isPep: "no" })).toBe(false);
  });

  it("shows the criminal record justification only when the record was cleared", () => {
    const field = getField(individualSchema, "criminalRecordJustification")!;
    expect(field.visibleIf!({ criminalRecord: "cleared" })).toBe(true);
    expect(field.visibleIf!({ criminalRecord: "none" })).toBe(false);
  });

  it("shows the whole authorized-person block only when acting on behalf of another person", () => {
    const field = getField(individualSchema, "authorizedPersonFullName")!;
    expect(field.visibleIf!({ actingOnBehalfOfAnother: "yes" })).toBe(true);
    expect(field.visibleIf!({ actingOnBehalfOfAnother: "no" })).toBe(false);
  });

  it("asks for the typed signature name only when signing electronically", () => {
    const field = getField(individualSchema, "signatureName")!;
    expect(field.visibleIf!({ signingMethod: "electronic" })).toBe(true);
    expect(field.visibleIf!({ signingMethod: "handwritten" })).toBe(false);
    expect((field.required as (a: Record<string, unknown>) => boolean)({ signingMethod: "electronic" })).toBe(
      true
    );
    expect((field.required as (a: Record<string, unknown>) => boolean)({ signingMethod: "handwritten" })).toBe(
      false
    );
  });

  it("shows the purchase/sale amount bracket only for sale or purchase deals", () => {
    const field = getField(individualSchema, "purchaseSaleAmountBracket")!;
    expect(field.visibleIf!({ dealType: "sale" })).toBe(true);
    expect(field.visibleIf!({ dealType: "purchase" })).toBe(true);
    expect(field.visibleIf!({ dealType: "rent" })).toBe(false);
    expect(field.visibleIf!({ dealType: "lease" })).toBe(false);
  });

  it("shows the rent/lease amount bracket only for rent or lease deals", () => {
    const field = getField(individualSchema, "rentLeaseAmountBracket")!;
    expect(field.visibleIf!({ dealType: "rent" })).toBe(true);
    expect(field.visibleIf!({ dealType: "lease" })).toBe(true);
    expect(field.visibleIf!({ dealType: "sale" })).toBe(false);
  });

  it("shows the purchase/sale 'more than 500k' description only when that bracket is chosen", () => {
    const field = getField(individualSchema, "purchaseSaleAmountDescription")!;
    expect(field.visibleIf!({ purchaseSaleAmountBracket: "more" })).toBe(true);
    expect(field.visibleIf!({ purchaseSaleAmountBracket: "up_to_50000" })).toBe(false);
  });
});
