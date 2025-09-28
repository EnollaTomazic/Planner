// @ts-nocheck
/// <reference types="@playwright/test" />
import { test } from "playwright/test";

type ResponseLike = {
  url(): string;
  status(): number;
};

type ResponseListeningPage = {
  on(event: "response", listener: (response: ResponseLike) => void): void;
  off(event: "response", listener: (response: ResponseLike) => void): void;
};

test.describe("GitHub Pages base path", () => {
  test("serves Next.js chunks and static assets without 404s", async ({ page }) => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const targetPath = `${basePath || ""}/preview/pages-check`;
    const nextAssetStatuses: Array<{ url: string; status: number }> = [];
    const staticAssetStatuses: Array<{ url: string; status: number }> = [];

    const playwrightPage = page as unknown as any;
    const pageWithEvents = page as unknown as ResponseListeningPage;
    const handleResponse = (response: ResponseLike) => {
      const url = response.url();
      if (url.includes("/_next/")) {
        nextAssetStatuses.push({ url, status: response.status() });
      } else if (url.includes("/hero_image.png")) {
        staticAssetStatuses.push({ url, status: response.status() });
      }
    };

    pageWithEvents.on("response", handleResponse);

    const response = await playwrightPage.goto(targetPath);
    await playwrightPage.waitForLoadState("networkidle");

    pageWithEvents.off("response", handleResponse);

    if (!response) {
      throw new Error(`Navigation to ${targetPath} failed`);
    }

    const responseStatus = response.status();
    if (responseStatus !== 200 && responseStatus !== 304) {
      throw new Error(
        `Expected a successful navigation response but received status ${responseStatus}`,
      );
    }
    if (nextAssetStatuses.length === 0) {
      throw new Error("No Next.js chunk responses were captured");
    }
    if (staticAssetStatuses.length === 0) {
      throw new Error("No static asset responses were captured");
    }

    for (const { url, status } of [...nextAssetStatuses, ...staticAssetStatuses]) {
      if (status >= 400) {
        throw new Error(`${url} returned ${status}`);
      }
    }

    const basePathValue = await playwrightPage.evaluate(() => {
      const marker = document.querySelector('[data-testid="base-path-value"]');
      return marker ? marker.textContent : null;
    });
    if (!basePathValue) {
      throw new Error("Base path marker was not rendered");
    }
    const normalizedValue = basePathValue;
    if (basePath) {
      if (!normalizedValue.includes(basePath)) {
        throw new Error(`Expected base path marker to include ${basePath}`);
      }
    } else {
      if (!normalizedValue.includes("/")) {
        throw new Error("Expected base path marker to include root slash");
      }
    }
  });
});
