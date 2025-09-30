import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./playwright";
import type { Page } from "./playwright";

import { BG_CLASSES, VARIANTS } from "@/lib/theme";

const HOME_ROUTE = "/";
const MAIN_SELECTOR = "main#main-content";

async function gotoHome(page: Page) {
  await page.goto(HOME_ROUTE);
  await page.waitForLoadState("networkidle");
  await page.waitForSelector("section[data-state=\"ready\"]", { state: "visible" });
  await page.emulateMedia({ reducedMotion: "reduce" });
}

async function setThemeVariant(page: Page, variantId: string) {
  const backgrounds = Array.from(BG_CLASSES);
  await page.evaluate(
    (args) => {
      const { id, backgrounds: bg } = args as {
        id: string;
        backgrounds: string[];
      };
      const root = document.documentElement;
      const removable: string[] = [];
      root.classList.forEach((className) => {
        if (className.startsWith("theme-")) {
          removable.push(className);
          return;
        }
        if (bg.includes(className)) {
          removable.push(className);
        }
      });
      if (removable.length > 0) {
        root.classList.remove(...removable);
      }
      root.classList.add(`theme-${id}`);
      const defaultBackground = bg[0];
      if (defaultBackground && defaultBackground.length > 0) {
        root.classList.add(defaultBackground);
      }
    },
    { id: variantId, backgrounds },
  );
}

async function ensureKeyboardModality(page: Page) {
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
}

async function resetFocus(page: Page) {
  await page.evaluate(() => {
    const active = document.activeElement;
    if (active && typeof (active as HTMLElement).blur === "function") {
      (active as HTMLElement).blur();
    }
  });
}

async function focusSummaryLink(page: Page) {
  await ensureKeyboardModality(page);
  const overviewRegion = page.locator('[aria-labelledby="home-overview-heading"]');
  await overviewRegion.waitFor();
  const plannerLink = overviewRegion.locator('a[href="/planner"]').first();
  const target = (await plannerLink.count()) > 0 ? plannerLink : overviewRegion.locator("a").first();
  await target.focus();
  await expect(target).toBeFocused();
  await page.waitForTimeout(100);
}

async function focusCalendarSelection(page: Page) {
  await ensureKeyboardModality(page);
  const selectedDay = page
    .locator('[aria-labelledby="home-overview-heading"]')
    .locator('button[aria-pressed="true"]')
    .first();
  await selectedDay.waitFor();
  await selectedDay.focus();
  await expect(selectedDay).toBeFocused();
  await page.waitForTimeout(100);
}

async function auditKeyboardTraversal(page: Page) {
  const visited = new Set<string>();
  for (let index = 0; index < 6; index += 1) {
    await page.keyboard.press("Tab");
    const fingerprint = await page.evaluate(() => {
      const active = document.activeElement as HTMLElement | null;
      if (!active) {
        return "<none>";
      }
      const role = active.getAttribute("role");
      const name = active.getAttribute("aria-label") ?? active.textContent ?? "";
      const href = active instanceof HTMLAnchorElement ? active.getAttribute("href") ?? "" : "";
      return [active.tagName.toLowerCase(), role ?? "", href, name.trim()].join("|");
    });
    visited.add(fingerprint);
  }
  expect(visited.size).toBeGreaterThan(1);
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
}

test.describe("Home glitch landing", () => {
  test("@visual theme × state matrix", async ({ page }) => {
    await gotoHome(page);
    const target = page.locator(MAIN_SELECTOR);
    await target.waitFor();

    const states: { id: string; apply: (page: Page) => Promise<void> }[] = [
      { id: "default", apply: async () => {} },
      { id: "summary-focus", apply: focusSummaryLink },
      { id: "calendar-focus", apply: focusCalendarSelection },
    ];

    for (const variant of VARIANTS) {
      await setThemeVariant(page, variant.id);
      for (const state of states) {
        await resetFocus(page);
        await state.apply(page);
        await page.waitForTimeout(100);
        await expect(target).toHaveScreenshot(
          `home-glitch-${variant.id}-${state.id}.png`,
          { animations: "disabled" },
        );
      }
    }
  });

  test("@axe meets WCAG AA and avoids keyboard traps", async ({ page }) => {
    await gotoHome(page);
    await page.locator(MAIN_SELECTOR).waitFor();

    const builder = new AxeBuilder({ page }) as any;
    const results = (await builder
      .include(MAIN_SELECTOR)
      .analyze()) as { violations: { id: string }[] };

    const violationIds = results.violations.map((violation: { id: string }) => violation.id);
    expect(results.violations).toEqual([]);
    expect(violationIds).toEqual([]);

    await expect(page.getByRole("link", { name: "Skip to main content" })).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
    await auditKeyboardTraversal(page);
  });
});

