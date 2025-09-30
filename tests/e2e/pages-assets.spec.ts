import { access } from "fs/promises";
import path from "path";
import { test, expect } from "./playwright";

const NEXT_ASSET_PREFIX = "/_next/";

const isAssetRequest = (resourceType: string) => resourceType === "script" || resourceType === "stylesheet";

type ResponseLike = {
  url(): string;
  status(): number;
  request(): { resourceType(): string };
};

type ResponseListeningPage = {
  on(event: "response", listener: (response: ResponseLike) => void): void;
  off(event: "response", listener: (response: ResponseLike) => void): void;
};

test.describe("Pages assets", () => {
  test("load successfully and export includes .nojekyll", async ({ page }) => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const collectedStatuses: Array<number> = [];

    const onResponse = (response: ResponseLike) => {
      if (!response.url().includes(NEXT_ASSET_PREFIX)) {
        return;
      }

      const resourceType = response.request().resourceType();
      if (!isAssetRequest(resourceType)) {
        return;
      }

      collectedStatuses.push(response.status());
    };

    const pageWithNetworkEvents = page as unknown as ResponseListeningPage;
    pageWithNetworkEvents.on("response", onResponse);

    await page.goto(`${basePath || "/"}`);
    await page.waitForLoadState("networkidle");

    pageWithNetworkEvents.off("response", onResponse);

    for (const status of collectedStatuses) {
      expect(status).toBe(200);
    }

    const exportRoot = process.env.NEXT_EXPORT_DIR ?? "out";
    const noJekyllPath = path.resolve(process.cwd(), exportRoot, ".nojekyll");

    await access(noJekyllPath);
  });
});
