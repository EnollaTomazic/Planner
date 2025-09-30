declare module "playwright-core/lib/server/registry/index" {
  type BrowserName = "chromium" | "firefox" | "webkit";

  interface ExecutableDescriptor {
    executablePath?: () => string | undefined;
  }

  export const registry: {
    findExecutable(name: BrowserName): ExecutableDescriptor | undefined;
  };
}
