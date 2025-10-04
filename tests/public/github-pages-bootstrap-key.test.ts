import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { GITHUB_PAGES_REDIRECT_STORAGE_KEY } from "@/lib/github-pages";

describe("github pages bootstrap storage key", () => {
  it("matches the storage key literal in the bootstrap script", () => {
    const scriptPath = path.join(
      process.cwd(),
      "public",
      "scripts",
      "github-pages-bootstrap.js",
    );
    const contents = fs.readFileSync(scriptPath, "utf8");
    const keyLine = contents
      .split(/\r?\n/u)
      .find((line) => line.includes("defaultStorageKey"));

    expect(keyLine).toBeDefined();
    if (!keyLine) {
      return;
    }

    const literalMatch = keyLine.match(/"([^"']+)"/u);
    expect(literalMatch).not.toBeNull();
    expect(literalMatch?.[1]).toBe(GITHUB_PAGES_REDIRECT_STORAGE_KEY);
  });
});
