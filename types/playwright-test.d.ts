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

  type LocatorAssertionResult = LocatorAssertions & PageAssertions

  interface LocatorAssertions {
    toBeVisible(): Promise<void>
    toBeFocused(): Promise<void>
    toHaveAttribute(name: string, value: string): Promise<void>
    toHaveCount(value: number): Promise<void>
    toBeChecked(): Promise<void>
    not: LocatorAssertionResult
  }

  interface ScreenshotOptions {
    readonly fullPage?: boolean;
  }

  interface PageAssertions {
    toHaveScreenshot(name: string, options?: ScreenshotOptions): Promise<void>;
  }

  interface ValueAssertions {
    toEqual(value: unknown): void;
    toBe(value: unknown): void;
  }

  interface Locator {
    focus(): Promise<void>
    click(options?: Record<string, unknown>): Promise<void>
    first(): Locator
    getByRole(role: Role, options?: GetByRoleOptions): Locator
    evaluate<T, Args extends unknown[]>(
      fn: (element: Element, ...args: Args) => T,
      ...args: Args
    ): Promise<T>
    waitFor(options?: { state?: "attached" | "detached" | "visible" | "hidden"; timeout?: number }): Promise<void>
  }

  interface Keyboard {
    press(key: string): Promise<void>;
  }

  interface Page {
    setViewportSize(size: ViewportSize): Promise<void>;
    viewportSize(): ViewportSize | null;
    goto(url: string): Promise<void>;
    waitForLoadState(state?: string): Promise<void>;
    waitForSelector(selector: string): Promise<Locator>;
    waitForFunction<T>(fn: (...args: unknown[]) => T, ...args: unknown[]): Promise<T>;
    evaluate<T>(fn: (...args: unknown[]) => T, ...args: unknown[]): Promise<T>;
    addInitScript(script: () => void): Promise<void>;
    keyboard: Keyboard;
    getByRole(role: Role, options?: GetByRoleOptions): Locator;
    getByLabel(text: string | RegExp): Locator;
    locator(selector: string): Locator;
  }

  interface TestFixtures {
    page: Page;
  }

  interface TestExpect {
    (subject: Locator | Page): LocatorAssertionResult
    <T>(value: T): ValueAssertions
  }

  interface TestInfo {
    skip(reason?: string): void;
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
    extend<TFixtures>(fixtures: Record<string, unknown>): TestFunction;
  }

  export const test: TestFunction;
  export const expect: TestExpect;
  export type { PlaywrightTestConfig, Page, TestInfo };
}

declare module "@playwright/test" {
  export * from "playwright/test";
}
