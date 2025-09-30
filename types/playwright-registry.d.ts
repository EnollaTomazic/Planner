declare module "playwright-core/lib/server/registry/index" {
  type BrowserName = "chromium" | "firefox" | "webkit";

  interface ExecutableEntry {
    executablePath?: () => string | undefined;
  }

  export const registry: {
    findExecutable(name: BrowserName): ExecutableEntry | undefined;
  };
}
