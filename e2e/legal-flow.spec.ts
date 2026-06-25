import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import { PDFParse } from "pdf-parse";

test("legal entity client fills out the questionnaire and downloads a PDF", async ({ page }) => {
  // 1. Agent creates a link for the client
  await page.goto("/izveidot");
  await page.getByLabel("Firma", { exact: true }).selectOption({ label: 'SIA "SUN RAIN"' });
  await page.getByLabel("Klienta tips", { exact: true }).selectOption({ label: "Juridiska persona" });
  await page.getByLabel("Adrese", { exact: true }).fill("Dārzciema iela 5, Rīga");
  await page.getByLabel("Darījuma veids", { exact: true }).selectOption({ label: "NĪ iegāde" });
  await page.getByRole("button", { name: "Izveidot saiti", exact: true }).click();

  const link = await page.getByTestId("generated-link").innerText();
  expect(link).toContain("/aizpildit?d=");

  // 2. Client opens the link and fills out the questionnaire
  await page.goto(link);
  await expect(page.getByText("Dārzciema iela 5, Rīga")).toBeVisible();

  // Step: company info
  await page.getByLabel("Nosaukums, juridiskā forma", { exact: true }).fill('SIA "Testa Klients"');
  await page.getByLabel("Reģistrācijas numurs un datums", { exact: true }).fill("40003999999, 01.01.2020");
  await page.getByLabel("Juridiskā adrese", { exact: true }).fill("Dārzciema iela 5, Rīga");
  await page.getByTestId("issuesBearerShares").getByRole("radio", { name: "nē", exact: true }).check();
  await page
    .getByLabel("Persona, kura ir tiesīga pārstāvēt klientu: vārds, uzvārds, personas kods", { exact: true })
    .fill("Anna Kalniņa, 020280-12345");
  await page.getByLabel("Amats", { exact: true }).fill("Valdes locekle");
  await page
    .getByLabel("Kontaktinformācija: tālrunis, e-pasts", { exact: true })
    .fill("+37120000001, anna.kalnina@example.com");
  await page.getByRole("button", { name: "Tālāk", exact: true }).click();

  // Step: economic activity & source of funds
  await page.getByLabel("Saimnieciskā darbība", { exact: true }).fill("Nekustamā īpašuma pārvaldīšana");
  await page.getByLabel("Darbības veidi saskaņā ar NACE klasifikatoru", { exact: true }).fill("68.20");
  await page.getByTestId("licenseRequired").getByRole("radio", { name: "nē", exact: true }).check();
  await page
    .getByTestId("sourceOfFunds")
    .getByRole("radio", { name: "saimnieciskā darbība", exact: true })
    .check();
  await page.getByTestId("militaryGoodsConnection").getByRole("radio", { name: "nē", exact: true }).check();
  await page.getByTestId("sanctionsRegulationExposure").getByRole("radio", { name: "nē", exact: true }).check();
  await page.getByRole("button", { name: "Tālāk", exact: true }).click();

  // Step: sanctions screening
  await page.getByTestId("sanctionedPersonsConnection").getByRole("radio", { name: "nē", exact: true }).check();
  await page.getByRole("button", { name: "Tālāk", exact: true }).click();

  // Step: beneficial owner (PLG)
  await page.getByLabel("Vārds, uzvārds", { exact: true }).fill("Anna Kalniņa");
  await page.getByLabel("Valsts piederība", { exact: true }).fill("Latvija");
  await page.getByLabel("Pastāvīgās dzīvesvietas valsts", { exact: true }).fill("Latvija");
  await page
    .getByLabel(
      "Piederošo kontrolēto kapitāla daļu vai akciju īpatsvars kopējā skaitā, vai īstenojamās kontroles veids",
      { exact: true }
    )
    .fill("100%");
  await page
    .getByTestId("beneficialOwnerSanctionsConnection")
    .getByRole("radio", { name: "nē", exact: true })
    .check();
  await page.getByRole("button", { name: "Tālāk", exact: true }).click();

  // Step: deal terms
  await page
    .getByLabel("Darījuma attiecību vai gadījuma rakstura darījuma mērķis un paredzama būtība", { exact: true })
    .fill("Biroja telpu iegāde");
  await page
    .getByTestId("purchaseSaleAmountBracket")
    .getByRole("radio", { name: "līdz 100'000 EUR", exact: true })
    .check();
  await page
    .getByTestId("paymentInstitutions")
    .getByRole("checkbox", { name: "kredītiestādēs vai maksājuma iestādēs, kas reģistrētas Latvijā", exact: true })
    .check();
  await page.getByRole("button", { name: "Tālāk", exact: true }).click();

  // Step: declarations
  await page
    .getByTestId("beneficialOwnerPepStatus")
    .getByRole("radio", { name: "nav politiski nozīmīga persona (PNP) vai ar PNP saistīta persona", exact: true })
    .check();
  await page
    .getByTestId("criminalRecordRepresentativeAndOwner")
    .getByRole("radio", { name: "nav bijuši krimināli sodīti", exact: true })
    .check();
  await page
    .getByTestId("sanctionsCountryConnection")
    .getByRole("radio", {
      name: "nav saistīti ar valsti vai teritoriju, uz kuru attiecināmas sankcijas",
      exact: true,
    })
    .check();
  await page
    .getByTestId("criminalRecord")
    .getByRole("radio", { name: "neesmu bijis krimināli sodīts", exact: true })
    .check();
  await page.getByTestId("sanctionsComplianceCommitment").getByRole("checkbox").check();
  await page.getByTestId("truthfulInfoCommitment").getByRole("checkbox").check();
  await page.getByRole("button", { name: "Tālāk", exact: true }).click();

  // Step: GDPR consent
  await page.getByTestId("dataProcessingConsent1").getByRole("checkbox").check();
  await page.getByTestId("dataProcessingConsent2").getByRole("checkbox").check();
  await page.getByTestId("dataProcessingConsent3").getByRole("checkbox").check();
  // Signing electronically (eParakstī): everything stays as before - typed name + date.
  await page.getByTestId("signingMethod").getByRole("radio", { name: "Elektroniski (eParakstī)", exact: true }).check();
  await page
    .getByLabel("Personas, kura ir tiesīga pārstāvēt klientu, vārds, uzvārds", { exact: true })
    .fill("Anna Kalniņa");
  await page.getByLabel("Datums", { exact: true }).fill("2026-06-25");
  await page.getByRole("button", { name: "Pabeigt", exact: true }).click();

  // 3. Review screen -> download the PDF
  await page.getByRole("button", { name: "Lejupielādēt PDF", exact: true }).click();
  const download = await page.waitForEvent("download");
  expect(download.suggestedFilename()).toMatch(/\.pdf$/);

  const path = await download.path();
  const buffer = await fs.readFile(path!);
  const parser = new PDFParse({ data: buffer });
  const { text } = await parser.getText();
  await parser.destroy();

  expect(text).toContain("SUN RAIN");
  expect(text).toContain("Testa Klients");
  expect(text).toContain("Dārzciema iela 5, Rīga");
  expect(text).toContain("NĪ iegāde");
  expect(text).toContain("Klienta identifikācijas un izpētes anketa");
  expect(text).not.toContain("Paraksts");
});
