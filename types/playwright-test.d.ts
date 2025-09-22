declare module "@playwright/test" {
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
  }

  interface Locator {
    toBeVisible(): Promise<void>;
    toBeFocused(): Promise<void>;
  }

  interface Keyboard {
    press(key: string): Promise<void>;
  }

  interface Page {
    setViewportSize(size: ViewportSize): Promise<void>;
    goto(url: string): Promise<void>;
    keyboard: Keyboard;
    getByRole(role: Role, options?: GetByRoleOptions): Locator;
  }

  interface TestFixtures {
    page: Page;
  }

  interface TestExpect {
    (locator: Locator): LocatorAssertions;
  }

  interface TestDescribe {
    (name: string, fn: () => void): void;
    skip(name: string, fn: () => void): void;
  }

  interface TestFunction {
    (name: string, fn: (fixtures: TestFixtures) => Promise<void>): void;
    describe: TestDescribe;
    skip(condition: boolean, description?: string): void;
  }

  export const test: TestFunction;
  export const expect: TestExpect;
}
