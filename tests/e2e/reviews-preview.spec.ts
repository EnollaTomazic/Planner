import { expect, test } from "./playwright";

test.describe("Reviews preview", () => {
  test("exposes loading, error, and empty review states", async ({ page }) => {
    await page.goto("/preview/reviews");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("[data-theme-matrix-entry]");

    await expect(
      page.getByRole("heading", { name: "Reviews states" }),
    ).toBeVisible();
    await expect(
      page.getByRole("status", { name: "Loading review search" }),
    ).toBeVisible();
    await expect(
      page.locator("text=Network request failed"),
    ).toBeVisible();
    await expect(
      page.locator("text=We couldn’t load your review details."),
    ).toBeVisible();
    await expect(
      page.locator("text=You’re ready to capture your first review."),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Retry sync" }).nth(0),
    ).toBeVisible();
  });
});
