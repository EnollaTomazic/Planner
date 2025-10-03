import { expect, test } from "./playwright";
import type { Page } from "@playwright/test";

import { VARIANTS } from "@/lib/theme";
import type { GalleryPreviewRoute } from "@/components/gallery";

import {
  buildPreviewRouteUrl,
  createThemedUrl,
  getBackgroundsForRoute,
  getDepthPreviewRoutes,
} from "./utils/previewRoutes";
import { waitForThemeHydration, type ThemeHydrationPage } from "./utils/theme";

const previewRoutes = getDepthPreviewRoutes();

type PreviewTestPage = Page & ThemeHydrationPage;

async function visitPreview(
  page: PreviewTestPage,
  route: GalleryPreviewRoute,
  variantId: string,
  background: GalleryPreviewRoute["themeBackground"],
) {
  const { url, suffix } = buildPreviewRouteUrl(route);
  const themedUrl = createThemedUrl(url, variantId, background);

  await page.goto(themedUrl);
  await page.waitForLoadState("networkidle");
  await page.waitForSelector('[data-preview-ready="loaded"]');
  await waitForThemeHydration(page, variantId, background);
  await page.waitForFunction(
    () => !document.body.innerText.includes("Loading preview…"),
  );

  return { suffix };
}

test.describe("Gallery previews", () => {
  test("@visual depth previews render for screenshot capture", async ({ page }) => {
    const previewPage = page as unknown as PreviewTestPage;

    for (const route of previewRoutes) {
      const { url, suffix } = buildPreviewRouteUrl(route);
      await previewPage.goto(url);
      await previewPage.waitForLoadState("networkidle");
      await previewPage.waitForSelector('[data-preview-ready="loaded"]');
      await waitForThemeHydration(previewPage, route.themeVariant, route.themeBackground);
      await previewPage.waitForFunction(
        () => !document.body.innerText.includes("Loading preview…"),
      );
      await expect(page).toHaveScreenshot(`${route.slug}${suffix}.png`, {
        fullPage: true,
      });
    }
  });

  test("@visual depth previews capture per-theme snapshots", async ({ page }) => {
    const previewPage = page as unknown as PreviewTestPage;

    for (const route of previewRoutes) {
      const backgrounds = getBackgroundsForRoute(route);
      for (const variant of VARIANTS) {
        for (const background of backgrounds) {
          const { suffix } = await visitPreview(
            previewPage,
            route,
            variant.id,
            background,
          );
          const backgroundSuffix = background > 0 ? `--bg-${background}` : "";
          await expect(page).toHaveScreenshot(
            `${route.slug}${suffix}--${variant.id}${backgroundSuffix}.png`,
            {
              fullPage: true,
            },
          );
        }
      }
    }
  });

  test("@visual theme matrix renders across themes", async ({ page }) => {
    const previewPage = page as unknown as PreviewTestPage;

    await previewPage.goto("/preview/theme-matrix");
    await previewPage.waitForLoadState("networkidle");

    const firstGroupSelector =
      "[data-theme-matrix-entry]:nth-of-type(1) [data-theme-matrix-group]";
    await previewPage.waitForSelector(firstGroupSelector);
    await previewPage.waitForFunction(
      () => !document.body.innerText.includes("Loading preview…"),
    );

    for (const variant of VARIANTS) {
      await previewPage
        .locator(firstGroupSelector)
        .getByRole("radio", { name: variant.label })
        .first()
        .click();
      await previewPage.waitForFunction(
        (variantId) =>
          document.documentElement.classList.contains(`theme-${variantId}`),
        variant.id,
      );
      await previewPage.waitForFunction(
        () => !document.body.innerText.includes("Loading preview…"),
      );
      await expect(page).toHaveScreenshot(`theme-matrix--${variant.id}.png`, {
        fullPage: true,
      });
    }
  });

  test("@visual AI state matrix renders across themes", async ({ page }) => {
    const previewPage = page as unknown as PreviewTestPage;

    await previewPage.goto("/preview/ai-states");
    await previewPage.waitForLoadState("networkidle");

    const firstGroupSelector = "[data-ai-state-group]:nth-of-type(1)";
    await previewPage.waitForSelector(firstGroupSelector);
    await previewPage.waitForFunction(
      () => !document.body.innerText.includes("Loading preview…"),
    );

    for (const variant of VARIANTS) {
      await previewPage
        .locator("[data-ai-state-matrix]")
        .getByRole("radio", { name: variant.label })
        .first()
        .click();
      await previewPage.waitForFunction(
        (variantId) =>
          document.documentElement.classList.contains(`theme-${variantId}`),
        variant.id,
      );
      await previewPage.waitForFunction(
        () => !document.body.innerText.includes("Loading preview…"),
      );
      await expect(page).toHaveScreenshot(`ai-states--${variant.id}.png`, {
        fullPage: true,
      });
    }
  });
});
