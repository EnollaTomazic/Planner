import AxeBuilder from "@axe-core/playwright";
import type { AxeResults } from "axe-core";

import { test } from "./playwright";
import { HERO_ILLUSTRATION_STATES } from "@/data/heroImages";
import { VARIANTS } from "@/lib/theme";

import { waitForThemeHydration } from "./utils/theme";

const HERO_PREVIEW_PATH = "/preview/hero-images";

function buildPreviewUrl(variantId: string, state: string) {
  return `${HERO_PREVIEW_PATH}?variant=${variantId}&state=${state}&autoplay=0`;
}

test.describe("Hero illustrations preview", () => {
  test("renders across themes without accessibility regressions", async ({
    page,
  }) => {
    const playwrightPage =
      page as unknown as import("@playwright/test").Page;
    for (const variant of VARIANTS) {
      for (const state of HERO_ILLUSTRATION_STATES) {
        const url = buildPreviewUrl(variant.id, state);

        await playwrightPage.goto(url);
        await playwrightPage.waitForLoadState("networkidle");
        await waitForThemeHydration(playwrightPage, variant.id, 0);

        const htmlClassName = await playwrightPage.evaluate(
          () => document.documentElement.className,
        );
        if (!new RegExp(`\\btheme-${variant.id}\\b`).test(htmlClassName)) {
          throw new Error(
            `Expected html to include theme-${variant.id}, received "${htmlClassName}"`,
          );
        }

        const heroSelector = '[data-testid="hero-preview"]';
        const heroHandle = await playwrightPage.waitForSelector(heroSelector);
        if (!heroHandle) {
          throw new Error("Hero preview failed to render");
        }

        await playwrightPage.waitForFunction((arg) => {
          const selector = typeof arg === "string" ? arg : "";
          const element = selector
            ? (document.querySelector(selector) as HTMLElement | null)
            : null;
          if (!element) {
            return false;
          }
          const rect = element.getBoundingClientRect();
          const styles = window.getComputedStyle(element);
          return (
            rect.width > 0 &&
            rect.height > 0 &&
            styles.visibility !== "hidden" &&
            styles.display !== "none" &&
            styles.opacity !== "0"
          );
        }, heroSelector);

        const illustrationSelector = `${heroSelector} img`;
        const illustrationHandle = await playwrightPage.waitForSelector(
          illustrationSelector,
        );
        if (!illustrationHandle) {
          throw new Error("Hero illustration failed to render");
        }

        const alt =
          (await playwrightPage.evaluate((arg) => {
            const selector = typeof arg === "string" ? arg : "";
            const image = selector
              ? (document.querySelector(selector) as HTMLImageElement | null)
              : null;
            return image?.getAttribute("alt") ?? "";
          }, illustrationSelector)) ?? "";
        const ariaHidden = await playwrightPage.evaluate((arg) => {
          const selector = typeof arg === "string" ? arg : "";
          const image = selector
            ? (document.querySelector(selector) as HTMLImageElement | null)
            : null;
          return image?.getAttribute("aria-hidden") ?? null;
        }, illustrationSelector);
        if (!(alt.trim().length > 0 || ariaHidden === "true")) {
          throw new Error("Hero illustration missing alt text or aria-hidden");
        }

        const cls = await playwrightPage.evaluate(() => {
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
        if (cls >= 0.01) {
          throw new Error(`CLS exceeded threshold: ${cls}`);
        }

        const axe = (await new AxeBuilder({
          page: playwrightPage,
        }).analyze()) as AxeResults;
        if (axe.violations.length > 0) {
          const details = axe.violations
            .map((violation) => violation.id)
            .join(", ");
          throw new Error(`Axe violations detected: ${details}`);
        }
      }
    }
  });
});
