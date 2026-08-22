import { test, expect } from "@playwright/test";
import { loginAsAgent } from "./testAuth";

/** Creates a questionnaire link the way an agent does, then drops the agent session. */
async function openClientQuestionnaire(page: import("@playwright/test").Page, context: import("@playwright/test").BrowserContext) {
  await loginAsAgent(page);
  await page.getByLabel("Klienta tips", { exact: true }).selectOption({ label: "Fiziska persona" });
  await page.getByLabel("Adrese", { exact: true }).fill("Rīga, Brīvības iela 1");
  await page.getByRole("button", { name: "Izveidot saiti", exact: true }).click();
  const link = await page.getByTestId("generated-link").innerText();

  await context.clearCookies();
  await page.goto(link);
}

test("a client cannot click through the questionnaire leaving it empty", async ({ page, context }) => {
  await openClientQuestionnaire(page, context);

  await page.getByRole("button", { name: "Tālāk", exact: true }).click();

  await expect(page.getByText("Šis lauks ir obligāts").first()).toBeVisible();
  // Still on the first step: the name field the client never filled is still on screen.
  await expect(page.getByLabel("Vārds", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Lejupielādēt PDF" })).toHaveCount(0);
});

test("the message goes away once the client answers", async ({ page, context }) => {
  await openClientQuestionnaire(page, context);

  await page.getByRole("button", { name: "Tālāk", exact: true }).click();
  await expect(page.getByText("Šis lauks ir obligāts").first()).toBeVisible();

  await page.getByLabel("Vārds", { exact: true }).fill("Jānis");

  await expect(page.getByLabel("Vārds", { exact: true })).not.toHaveAttribute("aria-invalid", "true");
});
