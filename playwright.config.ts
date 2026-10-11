import { defineConfig, devices } from "@playwright/test";

const port = 4173;
const isCI = Boolean(process.env.CI);

// End-to-end tests run against the production build (`npm run build` first).
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "html",
  use: {
    baseURL: `http://localhost:${String(port)}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run preview -- --port ${String(port)} --strictPort`,
    url: `http://localhost:${String(port)}`,
    reuseExistingServer: !isCI,
  },
});
