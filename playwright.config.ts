import { defineConfig, devices } from "@playwright/test";

const e2ePort = process.env.E2E_PORT ?? "3100";
const e2eBaseUrl = `http://127.0.0.1:${e2ePort}`;

export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  workers: 1,
  use: {
    baseURL: e2eBaseUrl,
    trace: "on-first-retry"
  },
  webServer: {
    command: `NEXT_DIST_DIR=.next-e2e npm run dev -- --port ${e2ePort}`,
    url: e2eBaseUrl,
    reuseExistingServer: true,
    timeout: 120_000
  },
  projects: [
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] }
    }
  ]
});
