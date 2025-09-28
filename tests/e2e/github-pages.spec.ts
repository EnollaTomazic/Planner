// @ts-nocheck
/// <reference types="@playwright/test" />
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

import { VARIANTS, VARIANT_LABELS } from "../../src/lib/theme";

type NullableString = string | null;

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function resolveGitHubPagesBaseUrl(): NullableString {
  const explicit =
    process.env.PLAYWRIGHT_PAGES_BASE_URL ?? process.env.GITHUB_PAGES_BASE_URL;
  if (explicit && explicit.trim().length > 0) {
    return ensureTrailingSlash(explicit.trim());
  }

  const repository = process.env.GITHUB_REPOSITORY;
  if (!repository) {
    return null;
  }

  const [owner, repo] = repository.split("/");
  if (!owner || !repo) {
    return null;
  }

  if (repo.endsWith(".github.io")) {
    return ensureTrailingSlash(`https://${repo}`);
  }

  return ensureTrailingSlash(`https://${owner}.github.io/${repo}`);
}

const PAGES_BASE_URL = resolveGitHubPagesBaseUrl();

function toUrl(pathname: string): string {
  if (!PAGES_BASE_URL) {
    throw new Error("GitHub Pages base URL is not configured");
  }
  return new URL(pathname, PAGES_BASE_URL).toString();
}

test.describe("GitHub Pages deployment", () => {
  test.skip(!PAGES_BASE_URL, "GitHub Pages base URL is not available for testing.");

  test("Planner page loads with heading and week picker", async ({ page }) => {
    const plannerUrl = toUrl("planner/");
    await page.goto(plannerUrl, { waitUntil: "networkidle" });

    await expect(
      page.getByRole("heading", { name: "Planner for Today", exact: true }),
    ).toBeVisible();

    await expect(
      page.getByRole("listbox", { name: /Select a focus day between/i }),
    ).toBeVisible();
  });

  test("Theme toggle cycles through every theme", async ({ page }) => {
    await page.goto(PAGES_BASE_URL!, { waitUntil: "networkidle" });

    const html = page.locator("html");
    const themeTrigger = page.getByRole("button", { name: "Theme" });
    const themeListbox = page.getByRole("listbox", { name: "Theme" });

    for (const variant of VARIANTS) {
      await themeTrigger.click();
      await themeListbox.waitFor();
      await page.getByRole("option", { name: VARIANT_LABELS[variant.id] }).click();
      await expect(html).toHaveClass(new RegExp(`\\btheme-${variant.id}\\b`));
    }
  });

  test("Initial render has no cumulative layout shift", async ({ page }) => {
    const plannerUrl = toUrl("planner/");
    await page.goto(plannerUrl, { waitUntil: "networkidle" });

    const cls = await page.evaluate(() => {
      const entries = performance.getEntriesByType("layout-shift");
      let total = 0;
      for (const entry of entries) {
        const shift = entry as PerformanceEntry & {
          value?: number;
          hadRecentInput?: boolean;
        };
        if (typeof shift.value === "number" && !shift.hadRecentInput) {
          total += shift.value;
        }
      }
      return total;
    });

    await expect(cls).toBeLessThan(0.01);
  });

  test("Deployed planner passes axe without critical violations", async ({ page }) => {
    const plannerUrl = toUrl("planner/");
    await page.goto(plannerUrl, { waitUntil: "networkidle" });

    const results = await new AxeBuilder({ page }).analyze();
    const criticalViolations = results.violations.filter(
      (violation) => violation.impact === "critical",
    );

    expect(criticalViolations).toEqual([]);
  });
});
