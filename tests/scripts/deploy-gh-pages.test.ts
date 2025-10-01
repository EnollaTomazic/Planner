import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { flattenBasePathDirectory } from "../../scripts/deploy-gh-pages";

describe("flattenBasePathDirectory", () => {
  let tempRoot: string | undefined;

  afterEach(() => {
    if (tempRoot && fs.existsSync(tempRoot)) {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
    tempRoot = undefined;
  });

  it("merges nested contents while preserving existing duplicates", () => {
    const outDirParent = fs.mkdtempSync(path.join(os.tmpdir(), "planner-deploy-out-"));
    tempRoot = outDirParent;
    const outDir = path.join(outDirParent, "out");
    const slug = "planner";
    const nestedDir = path.join(outDir, slug);

    fs.mkdirSync(path.join(outDir, "assets"), { recursive: true });
    fs.mkdirSync(path.join(nestedDir, "assets"), { recursive: true });

    fs.writeFileSync(path.join(outDir, "assets", "existing.txt"), "existing");
    fs.writeFileSync(path.join(outDir, "404.html"), "fallback");

    fs.writeFileSync(path.join(nestedDir, "assets", "new.txt"), "new");
    fs.writeFileSync(path.join(nestedDir, "404.html"), "fallback");
    fs.writeFileSync(path.join(nestedDir, "index.html"), "<html></html>");

    flattenBasePathDirectory(outDir, slug);

    expect(fs.existsSync(path.join(outDir, slug))).toBe(false);
    expect(fs.readFileSync(path.join(outDir, "index.html"), "utf8")).toBe("<html></html>");
    expect(fs.readFileSync(path.join(outDir, "assets", "existing.txt"), "utf8")).toBe("existing");
    expect(fs.readFileSync(path.join(outDir, "assets", "new.txt"), "utf8")).toBe("new");
    expect(fs.readFileSync(path.join(outDir, "404.html"), "utf8")).toBe("fallback");
  });

  it("throws when duplicate files differ", () => {
    const outDirParent = fs.mkdtempSync(path.join(os.tmpdir(), "planner-deploy-out-"));
    tempRoot = outDirParent;
    const outDir = path.join(outDirParent, "out");
    const slug = "planner";
    const nestedDir = path.join(outDir, slug);

    fs.mkdirSync(nestedDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "index.html"), "root");
    fs.writeFileSync(path.join(nestedDir, "index.html"), "nested");

    expect(() => flattenBasePathDirectory(outDir, slug)).toThrow(
      /destination already exists with different content/,
    );
  });
});
