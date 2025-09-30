// @ts-nocheck
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { BG_CLASSES, VARIANTS } from "@/lib/theme";

const TEAM_ROUTE = "/team";

async function gotoTeam(page: Page) {
  await page.goto(TEAM_ROUTE);
  await page.waitForLoadState("networkidle");
  await page.waitForSelector("[data-scope=\"team\"] .glitch-card");
}

test.describe("Team glitch components acceptance", () => {
  test("@tokens glitch cards expose CSS variable tokens", async ({ page }) => {
    await gotoTeam(page);

    const cardTokenAudits = await page.$$eval(
      "[data-scope=\"team\"] .glitch-card",
      (elements) =>
        elements.map((element) => {
          const style = getComputedStyle(element);
          const baseShadow = style.getPropertyValue("--shadow-glitch-card").trim();
          const hoverShadow = style
            .getPropertyValue("--shadow-glitch-card-hover")
            .trim();
          return {
            className: element.className,
            baseShadow,
            hoverShadow,
            hasSpectrum: style
              .getPropertyValue("--glitch-card-spectrum-a")
              .trim().length > 0,
            hasHaloOpacity: style
              .getPropertyValue("--glitch-card-halo-opacity")
              .trim().length > 0,
          };
        }),
    );

    expect(cardTokenAudits.length).toBeGreaterThan(0);
    for (const audit of cardTokenAudits) {
      expect(audit.className).toContain("glitch-card");
      expect(audit.baseShadow.length).toBeGreaterThan(0);
      expect(audit.baseShadow).toContain("var(--shadow-outer-md)");
      expect(audit.hoverShadow.length).toBeGreaterThan(0);
      expect(audit.hoverShadow).toContain("var(--shadow-outer-lg)");
      expect(audit.hasSpectrum).toBe(true);
      expect(audit.hasHaloOpacity).toBe(true);
      expect(/shadow-\[[^\]]*(?:px|rem)/.test(audit.className)).toBe(false);
    }

    const railTokens = await page.$$eval(
      "[data-scope=\"team\"] .glitch-rail",
      (elements) =>
        elements.map((element) =>
          getComputedStyle(element)
            .getPropertyValue("--team-glitch-ring-shadow")
            .trim(),
        ),
    );

    for (const token of railTokens) {
      expect(token.length).toBeGreaterThan(0);
    }
  });

  test("@visual glitch surfaces maintain theme parity", async ({ page }) => {
    await gotoTeam(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    const target = page.locator("[data-scope=\"team\"] section").first();
    const backgrounds = Array.from(BG_CLASSES);

    for (const variant of VARIANTS) {
      await page.evaluate(
        ({ variantId, backgrounds: bg }: { variantId: string; backgrounds: string[] }) => {
          const { classList } = document.documentElement;
          const removable: string[] = [];
          classList.forEach((value) => {
            if (value.startsWith("theme-")) {
              removable.push(value);
              return;
            }
            if (bg.includes(value)) {
              removable.push(value);
            }
          });
          if (removable.length > 0) {
            classList.remove(...removable);
          }
          classList.add(`theme-${variantId}`);
          const defaultBackground = bg[0];
          if (defaultBackground && defaultBackground.length > 0) {
            classList.add(defaultBackground);
          }
        },
        { variantId: variant.id, backgrounds },
      );

      await expect(target).toHaveScreenshot(`team-glitch-${variant.id}.png`, {
        animations: "disabled",
      });
    }
  });

  test("@motion glitch halo animates on hover by default", async ({ page }) => {
    await gotoTeam(page);
    const card = page.locator("[data-scope=\"team\"] .glitch-card").first();
    await card.hover();

    const animationName = await card.evaluate((node) =>
      getComputedStyle(node, "::before").animationName,
    );
    expect(animationName).not.toBe("none");
  });

  test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("@motion glitch halo disables animated overlays when reduced", async ({ page }) => {
      await gotoTeam(page);
      const card = page.locator("[data-scope=\"team\"] .glitch-card").first();
      await card.hover();

      const animationName = await card.evaluate((node) =>
        getComputedStyle(node, "::before").animationName,
      );
      expect(animationName === "none" || animationName.length === 0).toBe(true);
    });
  });

  test("@axe glitch components satisfy WCAG AA", async ({ page }) => {
    await gotoTeam(page);

    const results = await new AxeBuilder({ page })
      .include('[data-scope="team"]')
      .analyze();

    expect(results.violations, results.violations.map((v) => v.id).join(", ")).toEqual([]);
  });

  test("@responsive glitch layout adapts across breakpoints", async ({ page }) => {
    const viewports = [
      { width: 360, height: 720 },
      { width: 1280, height: 720 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await gotoTeam(page);

      const hasOverflow = await page.evaluate(
        () =>
          document.scrollingElement !== null &&
          document.scrollingElement.scrollWidth >
            document.documentElement.clientWidth + 1,
      );
      expect(hasOverflow).toBe(false);

      const cards = page.locator("[data-scope=\"team\"] .glitch-card");
      const count = await cards.count();
      for (let index = 0; index < count; index += 1) {
        const box = await cards.nth(index).boundingBox();
        expect(box).not.toBeNull();
        if (!box) {
          continue;
        }
        expect(box.width).toBeLessThanOrEqual(viewport.width + 1);
        expect(box.x).toBeGreaterThanOrEqual(-1);
      }
    }
  });
});
