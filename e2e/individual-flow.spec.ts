import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import { PDFParse } from "pdf-parse";

test("individual client fills out the questionnaire and downloads a PDF", async ({ page }) => {
  // 1. Agent creates a link for the client
  await page.goto("/izveidot");
  await page.getByLabel("Firma", { exact: true }).selectOption({ label: 'SIA "EKOCENTRS"' });
  await page.getByLabel("Klienta tips", { exact: true }).selectOption({ label: "Fiziska persona" });
  await page.getByLabel("Adrese", { exact: true }).fill("Rīga, Brīvības iela 1");
  await page.getByLabel("Darījuma veids", { exact: true }).selectOption({ label: "NĪ pārdošana" });
  await page.getByLabel("Loma", { exact: true }).selectOption({ label: "Darījuma partneris" });
  await page.getByRole("button", { name: "Izveidot saiti", exact: true }).click();

  const link = await page.getByTestId("generated-link").innerText();
  expect(link).toContain("/aizpildit?d=");

  // 2. Client opens the link and fills out the questionnaire
  await page.goto(link);
  await expect(page.getByText("Rīga, Brīvības iela 1")).toBeVisible();

  // Step: personal info
  await page.getByLabel("Vārds", { exact: true }).fill("Jānis");
  await page.getByLabel("Uzvārds", { exact: true }).fill("Bērziņš");
  await page.getByLabel("Personas kods", { exact: true }).fill("010190-12345");
  await page.getByLabel("Tālrunis", { exact: true }).fill("+37120000000");
  await page.getByLabel("E-pasts", { exact: true }).fill("janis.berzins@example.com");
  await page.getByLabel("Dzimšanas vieta", { exact: true }).fill("Rīga");
  await page.getByLabel("Valsts piederība", { exact: true }).fill("Latvija");
  await page.getByLabel("Pastāvīgās dzīvesvietas (rezidences) valsts", { exact: true }).fill("Latvija");
  await page.getByRole("button", { name: "Tālāk", exact: true }).click();

  // Step: economic activity & source of funds
  await page
    .getByTestId("socialStatus")
    .getByRole("radio", { name: "algots darbinieks(-cе)", exact: true })
    .check();
  await page
    .getByTestId("businessActivityType")
    .getByRole("checkbox", { name: "starpniecība darījumos ar nekustamajiem īpašumiem", exact: true })
    .check();
  await page.getByTestId("militaryGoodsConnection").getByRole("radio", { name: "nē", exact: true }).check();
  await page.getByTestId("sanctionsRegulationExposure").getByRole("radio", { name: "nē", exact: true }).check();
  await page.getByTestId("sourceOfFunds").getByRole("checkbox", { name: "darba alga", exact: true }).check();
  await page
    .getByLabel("Jurisdikcija/jurisdikcijas, kuros klients veic saimniecisko vai personisko darbību", {
      exact: true,
    })
    .fill("Latvija");
  await page.getByLabel("Vidējais gada ienākums pēdējo trīs gadu laikā, EUR", { exact: true }).fill("20000");
  await page.getByLabel("Skaidras naudas īpatsvars ienākumā, %", { exact: true }).fill("0");
  await page.getByRole("button", { name: "Tālāk", exact: true }).click();

  // Step: sanctions screening
  await page.getByTestId("sanctionedPersonsConnection").getByRole("radio", { name: "nē", exact: true }).check();
  await page.getByRole("button", { name: "Tālāk", exact: true }).click();

  // Step: deal terms
  await page
    .getByLabel("Darījuma attiecību vai gadījuma rakstura darījuma mērķis un paredzama būtība", { exact: true })
    .fill("Dzīvokļa pārdošana");
  await page
    .getByTestId("purchaseSaleAmountBracket")
    .getByRole("radio", { name: "līdz 50'000 EUR", exact: true })
    .check();
  await page
    .getByTestId("paymentInstitutions")
    .getByRole("checkbox", { name: "kredītiestādēs vai maksājuma iestādēs, kas reģistrētas Latvijā", exact: true })
    .check();
  await page.getByRole("button", { name: "Tālāk", exact: true }).click();

  // Step: declarations
  await page.getByTestId("soleBeneficialOwnerConfirmation").getByRole("checkbox").check();
  await page.getByTestId("isPep").getByRole("radio", { name: "Nē", exact: true }).check();
  await page
    .getByTestId("criminalRecord")
    .getByRole("radio", { name: "neesmu bijis krimināli sodīts", exact: true })
    .check();
  await page.getByTestId("sanctionsComplianceCommitment").getByRole("checkbox").check();
  await page.getByTestId("truthfulInfoCommitment").getByRole("checkbox").check();
  await page
    .getByTestId("actingOnBehalfOfAnother")
    .getByRole("radio", { name: "Nē, darījumu/us veicu savā vārdā", exact: true })
    .check();
  await page.getByRole("button", { name: "Tālāk", exact: true }).click();

  // The "authorized person" step is skipped entirely because actingOnBehalfOfAnother = no

  // Step: GDPR consent
  await page.getByTestId("dataProcessingConsent1").getByRole("checkbox").check();
  await page.getByTestId("dataProcessingConsent2").getByRole("checkbox").check();
  await page.getByTestId("dataProcessingConsent3").getByRole("checkbox").check();
  // Signing by hand: the typed name field is hidden (already given earlier in the form),
  // a blank handwritten signature area appears in the document instead.
  await page.getByTestId("signingMethod").getByRole("radio", { name: "Parakstīšu ar roku", exact: true }).check();
  await expect(page.getByLabel("Klienta vārds, uzvārds", { exact: true })).toHaveCount(0);
  await page.getByLabel("Datums", { exact: true }).fill("25.06.2026");
  await page.getByRole("button", { name: "Pabeigt", exact: true }).click();

  // 3. Review screen -> download the PDF
  await page.getByRole("button", { name: "Lejupielādēt PDF", exact: true }).click();
  const download = await page.waitForEvent("download");
  // role=partner + dealType=sale -> the partner is the buyer ("Pircejs")
  expect(download.suggestedFilename()).toBe("Pircejs_Janis_Berzins_Riga,_Brivibas_iela_1.pdf");

  const path = await download.path();
  const buffer = await fs.readFile(path!);
  const parser = new PDFParse({ data: buffer });
  const { text } = await parser.getText();
  await parser.destroy();

  expect(text).toContain("EKOCENTRS");
  expect(text).toContain("Jānis");
  expect(text).toContain("Bērziņš");
  expect(text).toContain("Rīga, Brīvības iela 1");
  expect(text).toContain("NĪ pārdošana");
  expect(text).toContain("Paraksts");
  expect(text).toContain("Klienta darījuma partnera identifikācijas un izpētes anketa");
});
