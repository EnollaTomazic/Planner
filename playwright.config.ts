import type { PlaywrightTestConfig } from "playwright/test";

const HOST = process.env.PLAYWRIGHT_HOST ?? "127.0.0.1";
const PORT = process.env.PLAYWRIGHT_PORT ?? "3000";

const VIEWPORT_PRESETS = [
  { name: "w320", viewport: { width: 320, height: 720 } },
  { name: "w768", viewport: { width: 768, height: 1024 } },
  { name: "w1440", viewport: { width: 1440, height: 900 } },
] as const;

const BROWSER_PRESETS = [
  { name: "chromium", use: { browserName: "chromium" as const } },
  { name: "firefox", use: { browserName: "firefox" as const } },
  { name: "webkit", use: { browserName: "webkit" as const } },
];

const config: PlaywrightTestConfig = {
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? `http://${HOST}:${PORT}`,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  projects: BROWSER_PRESETS.flatMap((browser) =>
    VIEWPORT_PRESETS.map((viewport) => ({
      name: `${browser.name}-${viewport.name}`,
      use: {
        ...browser.use,
        viewport: viewport.viewport,
      },
    })),
  ),
};

export default config;
