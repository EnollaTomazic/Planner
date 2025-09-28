import { test } from "@playwright/test";

type CorePage = import("playwright-core").Page;

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const PAGES_CHECK_ROUTE = `${BASE_PATH}/preview/pages-check`;
const isNextAsset = (url: string) => url.includes("/_next/");

test.describe("pages export smoke check", () => {
  test("loads without 404 responses for Next.js assets", async ({ page }) => {
    const playwrightPage = page as unknown as CorePage;
    const navigationResponse = await playwrightPage.goto(PAGES_CHECK_ROUTE);
    if (!navigationResponse) {
      throw new Error("Navigation to the pages-check route failed.");
    }
    const navigationStatus = navigationResponse.status();
    if (navigationStatus >= 400) {
      throw new Error(`Navigation responded with status ${navigationStatus}.`);
    }

    await playwrightPage.waitForFunction(() => {
      const container = document.querySelector(
        '[data-testid="pages-check-container"]',
      );
      return container?.getAttribute("data-pages-check") === "ready";
    });

    const resourceUrls = await playwrightPage.evaluate(() => {
      const scripts = Array.from(
        document.querySelectorAll<HTMLScriptElement>("script[src]"),
        (node) => node.getAttribute("src"),
      );
      const styles = Array.from(
        document.querySelectorAll<HTMLLinkElement>(
          'link[rel="stylesheet"][href]'
        ),
        (node) => node.getAttribute("href"),
      );
      return [...scripts, ...styles].filter(
        (value): value is string => Boolean(value),
      );
    });

    const nextResourceUrls = resourceUrls.filter(isNextAsset);
    if (nextResourceUrls.length === 0) {
      throw new Error("No Next.js resources were detected on the page.");
    }

    const request = playwrightPage.context().request;
    const currentUrl = playwrightPage.url();

    for (const href of nextResourceUrls) {
      const absoluteUrl = new URL(href, currentUrl).toString();
      const response = await request.get(absoluteUrl);
      if (response.status() === 404) {
        throw new Error(`Next.js asset returned 404: ${absoluteUrl}`);
      }
    }

    const logoSrc = await playwrightPage
      .locator('[data-testid="pages-check-logo"]')
      .getAttribute("src");
    if (!logoSrc) {
      throw new Error("Pages check logo did not render a source attribute.");
    }

    const logoUrl = new URL(logoSrc, currentUrl).toString();
    const logoResponse = await request.get(logoUrl);
    if (logoResponse.status() === 404) {
      throw new Error(`Static asset returned 404: ${logoUrl}`);
    }
  });
});
