import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

import { THEME_STORAGE_KEY } from "@/lib/theme";
import { createStorageKey } from "@/lib/storage-key";

describe("theme bootstrap storage key", () => {
  it("matches the storage key literal in the bootstrap script", () => {
    const scriptPath = path.join(
      process.cwd(),
      "public",
      "scripts",
      "theme-bootstrap.js",
    );
    const contents = fs.readFileSync(scriptPath, "utf8");
    const keyLine = contents
      .split(/\r?\n/u)
      .find((line) => line.includes("THEME_STORAGE_KEY ="));

    expect(keyLine).toBeDefined();
    if (!keyLine) {
      return;
    }

    const literalMatch = keyLine.match(
      /THEME_STORAGE_KEY = (["'`])([^"'`]+)\1/,
    );

    expect(literalMatch).not.toBeNull();
    expect(literalMatch?.[2]).toBe(THEME_STORAGE_KEY);
  });
});
