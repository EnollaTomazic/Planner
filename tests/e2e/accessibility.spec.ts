import { test, expect } from "playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility", () => {
  test("@axe home page has no detectable accessibility violations", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const { violations } = await new AxeBuilder({ page }).analyze();

    expect(violations).toEqual([]);
  });
});
