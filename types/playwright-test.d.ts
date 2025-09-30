declare module "playwright/test" {
  type ViewportSize = { width: number; height: number };

  type Role =
    | "alert"
    | "alertdialog"
    | "application"
    | "article"
    | "banner"
    | "blockquote"
    | "button"
    | "caption"
    | "cell"
    | "checkbox"
    | "columnheader"
    | "combobox"
    | "complementary"
    | "contentinfo"
    | "definition"
    | "dialog"
    | "directory"
    | "document"
    | "feed"
    | "figure"
    | "form"
    | "grid"
    | "gridcell"
    | "group"
    | "heading"
    | "img"
    | "link"
    | "list"
    | "listbox"
    | "listitem"
    | "log"
    | "main"
    | "marquee"
    | "math"
    | "menu"
    | "menubar"
    | "menuitem"
    | "menuitemcheckbox"
    | "menuitemradio"
    | "navigation"
    | "none"
    | "note"
    | "option"
    | "paragraph"
    | "presentation"
    | "progressbar"
    | "radio"
    | "radiogroup"
    | "region"
    | "row"
    | "rowgroup"
    | "rowheader"
    | "scrollbar"
    | "search"
    | "searchbox"
    | "separator"
    | "slider"
    | "spinbutton"
    | "status"
    | "switch"
    | "tab"
    | "table"
    | "tablist"
    | "tabpanel"
    | "term"
    | "textbox"
    | "timer"
    | "toolbar"
    | "tooltip"
    | "tree"
    | "treegrid"
    | "treeitem";

  type GetByRoleOptions = {
    name?: string | RegExp;
  };

  interface LocatorAssertions {
    toBeVisible(): Promise<void>;
    toBeFocused(): Promise<void>;
    toHaveAttribute(name: string, value: string): Promise<void>;
  }

  interface ScreenshotOptions {
    readonly fullPage?: boolean;
    readonly animations?: "disabled" | "allow";
  }

  interface PageAssertions {
    toHaveScreenshot(name: string, options?: ScreenshotOptions): Promise<void>;
  }

  interface ValueAssertions {
    toEqual(value: unknown): void;
    toBe(value: unknown): void;
    toBeGreaterThan(value: number): void;
  }

  interface Locator {
    focus(): Promise<void>;
    first(): Locator;
    locator(selector: string): Locator;
    waitFor(options?: { state?: string }): Promise<void>;
    count(): Promise<number>;
    evaluate<T>(callback: (element: HTMLElement) => T): Promise<T>;
  }

  interface Keyboard {
    press(key: string): Promise<void>;
  }

  interface Page {
    setViewportSize(size: ViewportSize): Promise<void>;
    goto(url: string): Promise<void>;
    waitForLoadState(state?: string): Promise<void>;
    waitForSelector(selector: string, options?: { state?: string }): Promise<Locator>;
    waitForFunction<T>(fn: (...args: unknown[]) => T, ...args: unknown[]): Promise<T>;
    keyboard: Keyboard;
    getByRole(role: Role, options?: GetByRoleOptions): Locator;
    locator(selector: string): Locator;
    emulateMedia(options: { reducedMotion?: "reduce" | "no-preference" }): Promise<void>;
    evaluate<T>(fn: (...args: unknown[]) => T, ...args: unknown[]): Promise<T>;
    waitForTimeout(timeout: number): Promise<void>;
  }

  interface TestFixtures {
    page: Page;
  }

  interface TestExpect {
    (subject: Locator | Page): LocatorAssertions & PageAssertions;
    <T>(value: T): ValueAssertions;
  }

  interface PlaywrightProjectConfig {
    name?: string;
    use?: Record<string, unknown>;
  }

  interface ReporterEntry {
    0: string;
    1?: Record<string, unknown>;
  }

  interface PlaywrightTestConfig {
    testDir?: string;
    fullyParallel?: boolean;
    forbidOnly?: boolean;
    retries?: number;
    reporter?: string | ReporterEntry[];
    projects?: PlaywrightProjectConfig[];
    use?: Record<string, unknown>;
  }

  interface TestDescribe {
    (name: string, fn: () => void): void;
    skip(name: string, fn: () => void): void;
  }

  interface TestFunction {
    (name: string, fn: (fixtures: TestFixtures) => Promise<void>): void;
    describe: TestDescribe;
    skip(condition: boolean, description?: string): void;
    only(name: string, fn: (fixtures: TestFixtures) => Promise<void>): void;
  }

  export const test: TestFunction;
  export const expect: TestExpect;
  export type { PlaywrightTestConfig, Page };
}

declare module "@playwright/test" {
  export * from "playwright/test";
}
