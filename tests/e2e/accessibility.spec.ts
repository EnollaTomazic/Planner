import { test, expect } from "playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

test.describe("Accessibility", () => {
  test("@axe home page has no detectable accessibility violations", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const { violations } = await new AxeBuilder({ page }).analyze();

    const reportDirectory = process.env.AXE_REPORT_DIR ?? "playwright-report/axe";
    await mkdir(reportDirectory, { recursive: true });
    const reportPath = join(reportDirectory, "home.json");
    const reportPayload = {
      url: "/",
      violations,
      timestamp: new Date().toISOString(),
    } as const;
    await writeFile(reportPath, JSON.stringify(reportPayload, null, 2));

    expect(violations).toEqual([]);
  });
});
