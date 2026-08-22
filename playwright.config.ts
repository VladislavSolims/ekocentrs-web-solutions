import { defineConfig, devices } from "@playwright/test";
import {
  E2E_JOOMLA_SECRET,
  E2E_SESSION_SECRET,
  E2E_JOOMLA_LOGIN_URL,
} from "./e2e/testAuth";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    // .env.local carries the same values, so a dev server started by hand
    // (reuseExistingServer) accepts the same tokens the tests mint.
    env: {
      JOOMLA_SSO_SECRET: E2E_JOOMLA_SECRET,
      SESSION_SECRET: E2E_SESSION_SECRET,
      JOOMLA_LOGIN_URL: E2E_JOOMLA_LOGIN_URL,
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
