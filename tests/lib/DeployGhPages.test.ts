import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { flattenBasePathDirectory } from "../../scripts/deploy-gh-pages.ts";

const slug = "planner";
const createdRoots: string[] = [];

function createTemporaryOutDir(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "deploy-gh-pages-test-"));
  createdRoots.push(root);
  const outDir = path.join(root, "out");
  fs.mkdirSync(outDir, { recursive: true });
  return outDir;
}

afterEach(() => {
  // Clean up any temporary directories created during the test to avoid
  // polluting later tests on the same worker.
  while (createdRoots.length > 0) {
    const root = createdRoots.pop();
    if (!root) {
      continue;
    }
    try {
      fs.rmSync(root, { recursive: true, force: true });
    } catch {
      // Best-effort cleanup; ignore errors so that we do not interfere with
      // Vitest's reporting if the directory is already gone.
    }
  }
});

describe("flattenBasePathDirectory", () => {
  it("relocates slug conflicts without throwing", () => {
    const outDir = createTemporaryOutDir();
    const nestedDir = path.join(outDir, slug);
    const conflictingRouteDir = path.join(nestedDir, slug);
    fs.mkdirSync(conflictingRouteDir, { recursive: true });
    fs.writeFileSync(path.join(conflictingRouteDir, "index.html"), "route");
    fs.writeFileSync(path.join(nestedDir, "asset.txt"), "asset");

    expect(() => flattenBasePathDirectory(outDir, slug)).not.toThrow();
    expect(fs.readFileSync(path.join(outDir, slug, "index.html"), "utf8")).toBe("route");
    expect(fs.readFileSync(path.join(outDir, "asset.txt"), "utf8")).toBe("asset");

    const remainingEntries = fs.readdirSync(outDir);
    expect(remainingEntries.some((entry) => entry.startsWith(`${slug}.tmp`))).toBe(false);
  });
});
