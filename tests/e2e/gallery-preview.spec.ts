// @ts-nocheck
import { expect, test } from "./playwright";

import { getGalleryPreviewRoutes } from "@/components/gallery";
import { VARIANTS } from "@/lib/theme";

const previewRoutes = getGalleryPreviewRoutes();

function buildRouteUrl(route: (typeof previewRoutes)[number]) {
  const params = new URLSearchParams();
  const suffixParts: string[] = [];

  for (const axis of route.axisParams) {
    const option = axis.options[0];
    if (!option) {
      continue;
    }
    params.set(axis.key, option.value);
    suffixParts.push(`${axis.key}-${option.value}`);
  }

  const query = params.toString();
  const suffix = suffixParts.length > 0 ? `__${suffixParts.join("__")}` : "";
  return {
    url: query ? `/preview/${route.slug}?${query}` : `/preview/${route.slug}`,
    suffix,
  };
}

test.describe("Gallery previews", () => {
  test("@visual previews render for screenshot capture", async ({ page }) => {
    for (const route of previewRoutes) {
      const { url, suffix } = buildRouteUrl(route);
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
