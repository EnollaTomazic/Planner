import { access } from "fs/promises";
import path from "path";
import { test, expect } from "playwright/test";

type ResponseLike = { url(): string; status(): number };
type ResponseListeningPage = {
  on(event: "response", listener: (response: ResponseLike) => void): void;
  off(event: "response", listener: (response: ResponseLike) => void): void;
};

test.describe("Static export", () => {
  test("Next.js assets load and export folder contains .nojekyll", async ({ page }) => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const assetStatuses: Array<{ url: string; status: number }> = [];

    const pageWithNetworkEvents = page as unknown as ResponseListeningPage;
    const captureResponse = (response: ResponseLike) => {
      if (response.url().includes("/_next/")) {
        assetStatuses.push({ url: response.url(), status: response.status() });
      }
    };

    pageWithNetworkEvents.on("response", captureResponse);

    await page.goto(`${basePath || ""}/`);
    await page.waitForLoadState("networkidle");

    pageWithNetworkEvents.off("response", captureResponse);

    for (const { status } of assetStatuses) {
      expect(status).toBe(200);
    }

    const exportDirEnv = process.env.NEXT_EXPORT_DIR;
    if (!exportDirEnv) {
      return;
    }

    const exportRoot = exportDirEnv ?? "out";
    const noJekyllPath = path.resolve(process.cwd(), exportRoot, ".nojekyll");
    await access(noJekyllPath);
  });
});
