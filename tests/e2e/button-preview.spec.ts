// @ts-nocheck
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./playwright";

import { getGalleryPreviewRoutes } from "@/components/gallery";

const buttonRoutes = getGalleryPreviewRoutes().filter(
  (route) => route.entryId === "button" && route.stateId === null,
);

function buildRouteUrl(route: (typeof buttonRoutes)[number]) {
  const params = new URLSearchParams();
  const suffixParts: string[] = [];

  for (const axis of route.axisParams) {
    const option = axis.options[0];
    if (!option) continue;
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

test.describe("Button preview theming", () => {
  for (const route of buttonRoutes) {
    test(`theme ${route.themeVariant} maintains chroma + motion fallbacks`, async ({ page }) => {
      const { url } = buildRouteUrl(route);
      await page.goto(url);
      await page.waitForLoadState("networkidle");
      await page.waitForSelector('[data-preview-ready="loaded"]');
      await page.waitForFunction(
        () => !document.body.innerText.includes("Loading preview…"),
      );

      const primaryButton = page.getByRole("button", { name: "Primary tone" });
      await expect(primaryButton).toBeVisible();

      const primaryClasses = await primaryButton.evaluate((btn) => Array.from(btn.classList));
      expect(primaryClasses).toContain("shadow-outer-md");
      expect(primaryClasses).toContain("blob-primary");

      const neoShadow = await primaryButton.evaluate((btn) =>
        getComputedStyle(btn).getPropertyValue("--neo-shadow"),
      );
      expect(neoShadow).toContain("--btn-primary-shadow-rest");

      await primaryButton.hover();
      const boxShadow = await primaryButton.evaluate(
        (btn) => getComputedStyle(btn).boxShadow,
      );
      expect(boxShadow).not.toBe("none");

      const secondaryButton = page.getByRole("button", { name: "Default" });
      await expect(secondaryButton).toBeVisible();
      const secondaryClasses = await secondaryButton.evaluate((btn) =>
        Array.from(btn.classList),
      );
      expect(secondaryClasses).toContain("shadow-outer-md");
      expect(secondaryClasses).not.toContain("blob-primary");

      const ghostButton = page.getByRole("button", { name: "Info ghost" });
      await expect(ghostButton).toBeVisible();
      const ghostClasses = await ghostButton.evaluate((btn) => Array.from(btn.classList));
      expect(ghostClasses).not.toContain("shadow-outer-md");
      expect(ghostClasses).not.toContain("blob-primary");

      const defaultTransition = await primaryButton.evaluate(
        (btn) => getComputedStyle(btn).transitionDuration,
      );
      expect(defaultTransition.replace(/\s/g, "")).not.toMatch(/^0s(?:,0s)*$/);

      await page.emulateMedia({ reducedMotion: "reduce" });
      const reducedTransition = await primaryButton.evaluate(
        (btn) => getComputedStyle(btn).transitionDuration,
      );
      expect(reducedTransition.replace(/\s/g, "")).toMatch(/^0s(?:,0s)*$/);
      await page.emulateMedia({ reducedMotion: "no-preference" });

      await primaryButton.focus();
      const axe = await new AxeBuilder({ page })
        .include("[data-preview-container]")
        .withRules(["color-contrast"])
        .analyze();
      expect(axe.violations).toEqual([]);
    });
  }
});
