declare module "@axe-core/playwright" {
  import type { Page } from "playwright/test";

  interface AnalyzeResults {
    violations: unknown[];
  }

  export default class AxeBuilder {
    constructor(options: { page: Page });
    analyze(): Promise<AnalyzeResults>;
  }
}
