import { expect, test } from "@playwright/test";
import { NAV_ITEMS } from "@/config/nav";

test.describe("SiteChrome tab order", () => {
  test("focus follows the primary navigation order", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });

    await page.goto("/");
    await expect(
      page.getByRole("navigation", { name: "Primary" }),
    ).toBeVisible();

    const focusTargets = [
      page.getByRole("link", { name: "Skip to main content" }),
      page.getByRole("link", { name: "Home" }),
      ...NAV_ITEMS.map(({ label }) => page.getByRole("link", { name: label })),
      page.getByRole("button", { name: "Theme: cycle background" }),
      page.getByRole("button", { name: /^Theme$/ }),
      page.getByRole("button", { name: /animations/i }),
    ];

    for (const target of focusTargets) {
      await page.keyboard.press("Tab");
      await expect(target).toBeFocused();
    }
  });

  test("mobile bottom nav supports keyboard activation", async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 720 });

    await page.goto("/planner");
    await expect(
      page.getByRole("navigation", { name: "Primary mobile navigation" }),
    ).toBeVisible();

    const promptsItem = page.getByRole("button", { name: /Prompts/ });
    await promptsItem.focus();
    await expect(promptsItem).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(promptsItem).toHaveAttribute("aria-pressed", "true");
    await expect(promptsItem).toHaveAttribute("aria-current", "page");
  });
});
