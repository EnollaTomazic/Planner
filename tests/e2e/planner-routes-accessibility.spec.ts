import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

import { expect, test } from "./playwright";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

async function gotoAndWaitForHydration(page: Page, pathname: string) {
  const targetUrl = `${basePath}${pathname}`;
  await page.goto(targetUrl);
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("load");
  await page.waitForFunction(() => document.readyState === "complete");
  await page.waitForFunction(() => {
    const main = document.querySelector("main#main-content");
    if (!main) {
      return false;
    }
    if (main.childElementCount === 0) {
      return false;
    }
    const hasContent = main.textContent !== null && main.textContent.trim().length > 0;
    if (!hasContent) {
      return false;
    }
    const controls = Array.from(
      document.querySelectorAll<HTMLElement>("[aria-controls]"),
    );
    return controls.every((element) => {
      const value = element.getAttribute("aria-controls");
      if (!value) {
        return true;
      }
      const ids = value.split(/\s+/).filter(Boolean);
      if (ids.length === 0) {
        return true;
      }
      return ids.every((id) => document.getElementById(id));
    });
  });
}

test.describe("@axe planner feature routes", () => {
  const routes: Array<{ name: string; pathname: string }> = [
    { name: "planner", pathname: "/planner" },
    { name: "goals", pathname: "/goals" },
    { name: "reviews", pathname: "/reviews" },
    { name: "prompts", pathname: "/prompts" },
  ];

  for (const { name, pathname } of routes) {
    test(`@axe ${name} page has no detectable accessibility violations`, async ({ page }) => {
      await gotoAndWaitForHydration(page, pathname);

      const results = await new AxeBuilder({ page }).analyze();

      expect(results.violations).toEqual([]);
    });
  }
});
