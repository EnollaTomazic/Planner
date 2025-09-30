import { expect, test } from "./playwright";

import { VARIANTS } from "@/lib/theme";
import { getGalleryPreviewRoutes } from "@/components/gallery";

import { buildPreviewRouteUrl, createThemedUrl } from "./utils/previewRoutes";
import { waitForThemeHydration } from "./utils/theme";

const NEON_ICON_ENTRY_ID = "neon-icon";
const NEON_ICON_2XL_STATE_ID = "size-2xl";
const EXPECTED_ICON_SIZE = 72;

const neonIcon2xlRoute = getGalleryPreviewRoutes().find(
  (route) =>
    route.entryId === NEON_ICON_ENTRY_ID &&
    route.stateId === NEON_ICON_2XL_STATE_ID &&
    route.themeVariant === "lg" &&
    route.themeBackground === 0,
);

if (!neonIcon2xlRoute) {
  throw new Error("NeonIcon 2xl preview route is not registered");
}

const { url: baseUrl } = buildPreviewRouteUrl(neonIcon2xlRoute);

test.describe("NeonIcon 2xl sizing", () => {
  test("maintains the 2xl footprint across themes", async ({ page }) => {
    for (const { id: variantId } of VARIANTS) {
      const themedUrl = createThemedUrl(
        baseUrl,
        variantId,
        neonIcon2xlRoute.themeBackground,
      );

      await page.goto(themedUrl);
      await page.waitForLoadState("networkidle");
      await page.waitForSelector('[data-preview-ready="loaded"]');
      await waitForThemeHydration(page, variantId, neonIcon2xlRoute.themeBackground);
      await page.waitForFunction(
        () => !document.body.innerText.includes("Loading preview…"),
      );

      await page.waitForSelector('[data-testid="neon-icon-2xl"]');

      const { width, height } = await page.waitForFunction((themeValue) => {
        const themeId = typeof themeValue === "string" ? themeValue : "unknown";
        const icon = document.querySelector<HTMLElement>('[data-testid="neon-icon-2xl"]');
        if (!icon) {
          throw new Error(`NeonIcon 2xl preview did not render for theme ${themeId}`);
        }

        const rect = icon.getBoundingClientRect();
        return {
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        };
      }, variantId);

      expect(width).toBe(EXPECTED_ICON_SIZE);
      expect(height).toBe(EXPECTED_ICON_SIZE);
    }
  });
});
