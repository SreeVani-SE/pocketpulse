import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:5173",
    headless: true,
  },
  webServer: {
    command: "npm run dev -- --host --port 5173",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 120000,
  },
});
