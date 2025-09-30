import { existsSync } from "node:fs";
import { registry } from "playwright-core/lib/server/registry/index";

type BrowserName = "chromium" | "firefox" | "webkit";

type MissingBrowser = {
  name: BrowserName;
  executablePath?: string;
};

const REQUIRED_BROWSERS: BrowserName[] = ["chromium", "firefox", "webkit"];

function resolveExecutablePath(browserName: BrowserName): string | undefined {
  const executable = registry.findExecutable(browserName);
  if (!executable) {
    return undefined;
  }

  try {
    const executablePath = executable.executablePath?.();
    return typeof executablePath === "string" ? executablePath : undefined;
  } catch {
    return undefined;
  }
}

function hasExecutable(executablePath: string | undefined): executablePath is string {
  return Boolean(executablePath && existsSync(executablePath));
}

export function detectMissingBrowsers(): MissingBrowser[] {
  const missing: MissingBrowser[] = [];

  for (const browserName of REQUIRED_BROWSERS) {
    const executablePath = resolveExecutablePath(browserName);
    if (!hasExecutable(executablePath)) {
      missing.push({ name: browserName, executablePath });
    }
  }

  return missing;
}

export function buildMissingBrowserMessage(missing: MissingBrowser[]): string {
  if (missing.length === 0) {
    return "";
  }

  const browserSummary = missing
    .map(({ name, executablePath }) =>
      executablePath ? `${name} (expected at ${executablePath})` : name,
    )
    .join(", ");

  return [
    "Playwright browsers are not installed.",
    `Missing: ${browserSummary}.`,
    'Install them locally with "npx playwright install --with-deps" before running the E2E suite.',
  ].join(" ");
}
