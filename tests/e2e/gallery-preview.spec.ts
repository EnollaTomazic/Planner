// @ts-nocheck
import { expect, test } from "./playwright";

import { VARIANTS } from "@/lib/theme";

import {
  buildPreviewRouteUrl,
  createThemedUrl,
  getDepthPreviewRoutes,
} from "./utils/previewRoutes";

const previewRoutes = getDepthPreviewRoutes();

test.describe("Gallery previews", () => {
  test("@visual depth previews render for screenshot capture", async ({ page }) => {
    for (const route of previewRoutes) {
      const { url, suffix } = buildPreviewRouteUrl(route);
      await page.goto(url);
      await page.waitForLoadState("networkidle");
      await page.waitForSelector('[data-preview-ready="loaded"]');
      await page.waitForFunction(
        (variant) =>
          document.documentElement.classList.contains(`theme-${variant}`),
        route.themeVariant,
      );
      await expect(page).toHaveScreenshot(`${route.slug}${suffix}.png`, {
        fullPage: true,
      });
    }
  });

  test("@visual depth previews capture per-theme snapshots", async ({ page }) => {
    for (const route of previewRoutes) {
      const { url, suffix } = buildPreviewRouteUrl(route);

      for (const variant of VARIANTS) {
        const themedUrl = createThemedUrl(url, variant.id, route.themeBackground);
        await page.goto(themedUrl);
        await page.waitForLoadState("networkidle");
        await page.waitForSelector('[data-preview-ready="loaded"]');
        await page.waitForFunction(
          (variantId) =>
            document.documentElement.classList.contains(`theme-${variantId}`),
          variant.id,
        );
        await page.waitForFunction(
          () => !document.body.innerText.includes("Loading preview…"),
        );
        await expect(page).toHaveScreenshot(
          `${route.slug}${suffix}--${variant.id}.png`,
          {
            fullPage: true,
          },
        );
      }
    }
  });

  test("@visual theme matrix renders across themes", async ({ page }) => {
    await page.goto("/preview/theme-matrix");
    await page.waitForLoadState("networkidle");

    const firstGroupSelector =
      "[data-theme-matrix-entry]:nth-of-type(1) [data-theme-matrix-group]";
    await page.waitForSelector(firstGroupSelector);
    await page.waitForFunction(
      () => !document.body.innerText.includes("Loading preview…"),
    );

    for (const variant of VARIANTS) {
      await page.click(
        `${firstGroupSelector} button[role="radio"]:has-text("${variant.label}")`,
      );
      await page.waitForFunction(
        (variantId) =>
          document.documentElement.classList.contains(`theme-${variantId}`),
        variant.id,
      );
      await page.waitForFunction(
        () => !document.body.innerText.includes("Loading preview…"),
      );
      await expect(page).toHaveScreenshot(`theme-matrix--${variant.id}.png`, {
        fullPage: true,
      });
    }
  });
});
