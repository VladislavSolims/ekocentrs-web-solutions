import { test, expect } from "@playwright/test";
import { loginAsAgent, joomlaHandOffToken } from "./testAuth";

test("the link builder is closed to visitors without a Joomla session", async ({ page }) => {
  await page.goto("/izveidot");

  await expect(page).toHaveURL(/joomla-login-stub/);
});

test("a hand-off token signed with the wrong secret does not get in", async ({ page }) => {
  const forged = joomlaHandOffToken("not-the-shared-secret-not-the-shared");

  await page.goto(`/api/auth/joomla?token=${encodeURIComponent(forged)}`);

  await expect(page).not.toHaveURL(/izveidot/);
});

test("the client questionnaire stays open without any login", async ({ page, context }) => {
  await loginAsAgent(page);
  await page.getByLabel("Adrese", { exact: true }).fill("Rīga, Brīvības iela 1");
  await page.getByRole("button", { name: "Izveidot saiti", exact: true }).click();
  const link = await page.getByTestId("generated-link").innerText();

  // The client is not an agent and has no session at all.
  await context.clearCookies();
  await page.goto(link);

  await expect(page.getByText("Rīga, Brīvības iela 1")).toBeVisible();
});
