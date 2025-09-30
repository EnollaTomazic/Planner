import { expect, test as base } from "@playwright/test";

import {
  buildMissingBrowserMessage,
  detectMissingBrowsers,
} from "./utils/browser-installation";

const missingBrowsers = detectMissingBrowsers();
const skipReason = buildMissingBrowserMessage(missingBrowsers);

if (skipReason) {
  base.skip(true, skipReason);
}

export const test = base;
export { expect };
export type { Page } from "@playwright/test";
