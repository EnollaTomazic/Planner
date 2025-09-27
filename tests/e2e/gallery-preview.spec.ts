import { expect, test } from "@playwright/test";

import { getGalleryPreviewRoutes } from "@/components/gallery";

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
});
