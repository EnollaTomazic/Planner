import { expect, test as base } from "@playwright/test";

import {
  buildMissingBrowserMessage,
  detectMissingBrowsers,
} from "./utils/browser-installation";

const missingBrowsers = detectMissingBrowsers();
const skipReason = buildMissingBrowserMessage(missingBrowsers);

type TestFixtures = {
  skipIfBrowsersMissing: void;
};

export const test = base.extend<TestFixtures>({
  skipIfBrowsersMissing: [
    async ({}, use, testInfo) => {
      if (skipReason) {
        testInfo.skip(skipReason);
        return;
      }

      await use();
    },
    { auto: true },
  ],
});
export { expect };
export type { Page } from "@playwright/test";
