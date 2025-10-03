import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { test, expect } from "./playwright";
import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

import type { GalleryPreviewRoute } from "@/components/gallery";

import {
  buildPreviewRouteUrl,
  createThemedUrl,
  getDepthPreviewRoutes,
  NAV_BACKDROP_ENTRY_ID,
} from "./utils/previewRoutes";
import { waitForThemeHydration, type ThemeHydrationPage } from "./utils/theme";

const depthPreviewRoutes = getDepthPreviewRoutes();
const navBackdropRoute =
  depthPreviewRoutes.find(
    (route: GalleryPreviewRoute) => route.entryId === NAV_BACKDROP_ENTRY_ID,
  ) ?? null;

type PreviewTestPage = Page & ThemeHydrationPage;

test.describe("Accessibility", () => {
  test("@axe home page has no detectable accessibility violations", async ({ page }) => {
    const previewPage = page as unknown as PreviewTestPage;

    await previewPage.goto("/");
    await previewPage.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page: previewPage as unknown as Page }).analyze();

    if (process.env.AXE_RESULTS_PATH) {
      const destination = path.resolve(process.cwd(), process.env.AXE_RESULTS_PATH);
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, JSON.stringify(results, null, 2), { encoding: "utf-8" });
    }

    expect(results.violations).toEqual([]);
  });

  test("@axe theme matrix page has no detectable accessibility violations", async ({ page }) => {
    const previewPage = page as unknown as PreviewTestPage;

    await previewPage.goto("/preview/theme-matrix");
    await previewPage.waitForLoadState("networkidle");

    await previewPage.waitForSelector("[data-theme-matrix-group]");
    await previewPage.waitForFunction(
      () => !document.body.innerText.includes("Loading preview…"),
    );

    const results = await new AxeBuilder({ page: previewPage as unknown as Page }).analyze();

    expect(results.violations).toEqual([]);
  });

  test("@axe AI state matrix page has no detectable accessibility violations", async ({ page }) => {
    const previewPage = page as unknown as PreviewTestPage;

    await previewPage.goto("/preview/ai-states");
    await previewPage.waitForLoadState("networkidle");

    await previewPage.waitForSelector("[data-ai-state-matrix]");
    await previewPage.waitForFunction(
      () => !document.body.innerText.includes("Loading preview…"),
    );

    const results = await new AxeBuilder({ page: previewPage as unknown as Page }).analyze();

    expect(results.violations).toEqual([]);
  });

  test("@axe depth preview routes remain accessible", async ({ page }) => {
    const previewPage = page as unknown as PreviewTestPage;

    for (const route of depthPreviewRoutes) {
      const { url } = buildPreviewRouteUrl(route);
      const themedUrl = createThemedUrl(
        url,
        route.themeVariant,
        route.themeBackground,
      );

      await previewPage.goto(themedUrl);
      await previewPage.waitForLoadState("networkidle");
      await previewPage.waitForSelector('[data-preview-ready="loaded"]');
      await waitForThemeHydration(previewPage, route.themeVariant, route.themeBackground);
      await previewPage.waitForFunction(
        () => !document.body.innerText.includes("Loading preview…"),
      );

      const results = await new AxeBuilder({ page: previewPage as unknown as Page }).analyze();

      expect(results.violations).toEqual([]);
    }
  });

  test("@axe nav/backdrop contrast remains accessible", async ({ page }) => {
    const previewPage = page as unknown as PreviewTestPage;

    test.skip(!navBackdropRoute, "Nav/backdrop preview not registered");

    if (!navBackdropRoute) {
      return;
    }

    const { url } = buildPreviewRouteUrl(navBackdropRoute);
    const variantId = "noir";
    const background = 3;
    const themedUrl = createThemedUrl(url, variantId, background);

    await previewPage.goto(themedUrl);
    await previewPage.waitForLoadState("networkidle");
    await previewPage.waitForSelector('[data-preview-ready="loaded"]');
    await waitForThemeHydration(previewPage, variantId, background);
    await previewPage.waitForFunction(
      () => !document.body.innerText.includes("Loading preview…"),
    );

    const results = await new AxeBuilder({ page: previewPage as unknown as Page }).analyze();

    expect(results.violations).toEqual([]);
  });
});
