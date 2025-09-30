// @ts-nocheck
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { test, expect } from "./playwright";
import AxeBuilder from "@axe-core/playwright";

import {
  buildPreviewRouteUrl,
  createThemedUrl,
  getDepthPreviewRoutes,
} from "./utils/previewRoutes";

const depthPreviewRoutes = getDepthPreviewRoutes();

test.describe("Accessibility", () => {
  test("@axe home page has no detectable accessibility violations", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page }).analyze();

    if (process.env.AXE_RESULTS_PATH) {
      const destination = path.resolve(process.cwd(), process.env.AXE_RESULTS_PATH);
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, JSON.stringify(results, null, 2), { encoding: "utf-8" });
    }

    expect(results.violations).toEqual([]);
  });

  test("@axe theme matrix page has no detectable accessibility violations", async ({ page }) => {
    await page.goto("/preview/theme-matrix");
    await page.waitForLoadState("networkidle");

    await page.waitForSelector("[data-theme-matrix-group]");
    await page.waitForFunction(
      () => !document.body.innerText.includes("Loading preview…"),
    );

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  });

  test("@axe depth preview routes remain accessible", async ({ page }) => {
    for (const route of depthPreviewRoutes) {
      const { url } = buildPreviewRouteUrl(route);
      const themedUrl = createThemedUrl(
        url,
        route.themeVariant,
        route.themeBackground,
      );

      await page.goto(themedUrl);
      await page.waitForLoadState("networkidle");
      await page.waitForSelector('[data-preview-ready="loaded"]');
      await page.waitForFunction(
        () => !document.body.innerText.includes("Loading preview…"),
      );

      const results = await new AxeBuilder({ page }).analyze();

      expect(results.violations).toEqual([]);
    }
  });
});
