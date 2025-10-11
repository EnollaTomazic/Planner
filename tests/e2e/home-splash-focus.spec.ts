import AxeBuilder from "@axe-core/playwright";

import { expect, test } from "./playwright";

test.describe("Home splash focus management", () => {
  test("@axe splash overlay keeps focus while active", async ({ page }) => {
    await page.goto("/");

    const splash = page.locator("[data-home-splash]");
    await splash.waitFor({ state: "visible" });

    const status = page.locator("[data-home-splash-status]");
    await status.waitFor({ state: "visible" });

    await expect(status).toBeFocused();

    const content = page.locator("[data-home-content]");
    await expect(content).toHaveAttribute("data-inert", "");

    const focusAttemptWhileInert = await page.evaluate(() => {
      const main = document.querySelector<HTMLElement>("[data-home-content]");

      if (!main) {
        return null;
      }

      const focusable = main.querySelector<HTMLElement>(
        "a, button, input, select, textarea, [tabindex]:not([tabindex='-1'])",
      );

      if (!focusable) {
        return null;
      }

      focusable.focus();

      return document.activeElement === focusable;
    });

    if (focusAttemptWhileInert === null) {
      throw new Error("Expected home content to expose a focusable control");
    }

    expect(focusAttemptWhileInert).toBe(false);

    const axeResults = await new AxeBuilder({ page }).include("[data-home-splash]").analyze();

    expect(axeResults.violations).toEqual([]);

    await splash.waitFor({ state: "hidden" });

    await expect(content).not.toHaveAttribute("data-inert", "");

    const focusAttemptAfterDismiss = await page.evaluate(() => {
      const main = document.querySelector<HTMLElement>("[data-home-content]");

      if (!main) {
        return null;
      }

      const focusable = main.querySelector<HTMLElement>(
        "a, button, input, select, textarea, [tabindex]:not([tabindex='-1'])",
      );

      if (!focusable) {
        return null;
      }

      focusable.focus();

      return document.activeElement === focusable;
    });

    if (focusAttemptAfterDismiss === null) {
      throw new Error("Expected home content to expose a focusable control");
    }

    expect(focusAttemptAfterDismiss).toBe(true);
  });
});
