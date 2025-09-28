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
    toHaveScreenshot(name: string, options?: ScreenshotOptions): Promise<void>;
  }

  interface ScreenshotOptions {
    readonly fullPage?: boolean;
    readonly animations?: "disabled" | "allow";
    readonly caret?: "hide" | "initial";
    readonly scale?: "css" | "device";
  }

  interface PageAssertions {
    toHaveScreenshot(name: string, options?: ScreenshotOptions): Promise<void>;
  }

  interface ValueAssertions<T = unknown> {
    toEqual(value: T): void;
    toBe(value: T): void;
    toBeGreaterThan(value: number): void;
  }

  interface Locator {
    focus(): Promise<void>;
    first(): Locator;
    locator(selector: string): Locator;
    waitFor(options?: { state?: string; timeout?: number }): Promise<void>;
    evaluate<TReturn, TArg = void>(
      fn: (element: Element, arg: TArg) => TReturn | Promise<TReturn>,
      arg?: TArg,
    ): Promise<TReturn>;
  }

  interface Keyboard {
    press(key: string): Promise<void>;
  }

  interface Page {
    setViewportSize(size: ViewportSize): Promise<void>;
    goto(url: string): Promise<void>;
    waitForLoadState(state?: string): Promise<void>;
    waitForSelector(selector: string): Promise<Locator>;
    waitForFunction<T>(fn: (...args: unknown[]) => T, ...args: unknown[]): Promise<T>;
    emulateMedia(options: { reducedMotion?: "reduce" | "no-preference" }): Promise<void>;
    keyboard: Keyboard;
    getByRole(role: Role, options?: GetByRoleOptions): Locator;
    locator(selector: string): Locator;
  }

  interface TestFixtures {
    page: Page;
  }

  interface TestInfo {
    project: { name: string };
  }

  interface TestExpect {
    (subject: Locator): LocatorAssertions & PageAssertions;
    (subject: Page): LocatorAssertions & PageAssertions;
    <T>(value: T): ValueAssertions<T>;
    soft: TestExpect;
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
    info(): TestInfo;
  }

  export const test: TestFunction;
  export const expect: TestExpect;
  export type { PlaywrightTestConfig, Page };
}

declare module "@playwright/test" {
  export * from "playwright/test";
}
