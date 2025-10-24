import AxeBuilder from "@axe-core/playwright";

import { VARIANTS } from "@/lib/theme";
import type { GalleryPreviewRoute } from "@/components/gallery/registry";

import { expect, test, type Page } from "./playwright";
import { buildPreviewRouteUrl } from "./utils/previewRoutes";
import { waitForThemeHydration } from "./utils/theme";
import { getManifestPreviewRoutes } from "./utils/galleryManifest";

const PREVIEW_READY_SELECTOR = '[data-preview-ready="loaded"]';
const RADIO_MATRIX_PREVIEW_ID = "ui:radio-icon-group:matrix";
const RADIO_DEFAULT_PREVIEW_ID = "ui:radio-icon-group:state:default";
const RADIO_FOCUS_PREVIEW_ID = "ui:radio-icon-group:state:focus-visible";
const RADIO_GROUP_NAME = "radio-icon-group-default";

const RADIO_ICON_GROUP_LABELS = ["Sun", "Moon", "Flame", "Shield"] as const;

const previewRoutes = getManifestPreviewRoutes();

const matrixRoutes = previewRoutes.filter(
  (route) =>
    route.previewId === RADIO_MATRIX_PREVIEW_ID && route.themeBackground === 0,
);

const defaultStateRoute = previewRoutes.find(
  (route) =>
    route.previewId === RADIO_DEFAULT_PREVIEW_ID &&
    route.themeBackground === 0 &&
    route.themeVariant === "lg",
);

const focusRoutes = previewRoutes.filter(
  (route) =>
    route.previewId === RADIO_FOCUS_PREVIEW_ID && route.themeBackground === 0,
);

if (!matrixRoutes.length) {
  throw new Error("RadioIconGroup matrix preview route could not be resolved");
}

if (!defaultStateRoute) {
  throw new Error("RadioIconGroup default state preview route could not be resolved");
}

if (!focusRoutes.length) {
  throw new Error("RadioIconGroup focus-visible preview routes could not be resolved");
}

async function visitPreview(page: Page, route: GalleryPreviewRoute) {
  const { url } = buildPreviewRouteUrl(route);
  await page.goto(url);
  await page.waitForLoadState("domcontentloaded");
  await page.waitForSelector(PREVIEW_READY_SELECTOR);
  await waitForThemeHydration(page, route.themeVariant, route.themeBackground);
  await page.waitForFunction(
    () => !document.body.innerText.includes("Loading preview…"),
  );
}

test.describe("@ui RadioIconGroup", () => {
  test("supports native keyboard navigation and remains axe-clean", async ({ page }) => {
    await visitPreview(page, defaultStateRoute);

    const radios = page.locator(`input[type="radio"][name="${RADIO_GROUP_NAME}"]`);
    await expect(radios).toHaveCount(RADIO_ICON_GROUP_LABELS.length);

    await page.keyboard.press("Tab");

    const sun = page.getByLabel("Sun");
    await expect(sun).toBeFocused();
    await expect(sun).toBeChecked();

    await page.keyboard.press("ArrowRight");

    const moon = page.getByLabel("Moon");
    await expect(moon).toBeFocused();
    await expect(moon).toBeChecked();

    await page.keyboard.press("ArrowLeft");
    await expect(sun).toBeFocused();
    await expect(sun).toBeChecked();

    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations).toEqual([]);
  });

  test("@visual focus-visible state retains glow and contrast across themes", async ({ page }) => {
    for (const variant of VARIANTS) {
      const route = focusRoutes.find(
        (entry) => entry.themeVariant === variant.id,
      );

      if (!route) {
        throw new Error(
          `Missing focus-visible preview for theme variant: ${variant.id}`,
        );
      }

      await visitPreview(page, route);

      const screenshotName = `radio-icon-group--focus-visible--${variant.id}.png`;
      await expect(page).toHaveScreenshot(screenshotName, {
        fullPage: true,
      });
    }
  });
});
