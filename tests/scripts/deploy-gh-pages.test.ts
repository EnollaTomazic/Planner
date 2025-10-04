import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  flattenBasePathDirectory,
  injectGitHubPagesPlaceholders,
} from "../../scripts/deploy-gh-pages";
import { GITHUB_PAGES_REDIRECT_STORAGE_KEY } from "@/lib/github-pages";

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

describe("injectGitHubPagesPlaceholders", () => {
  let tempRoot: string | undefined;

  afterEach(() => {
    if (tempRoot && fs.existsSync(tempRoot)) {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
    tempRoot = undefined;
  });

  it("replaces base path and storage key placeholders", () => {
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "planner-gh-pages-placeholders-"));
    tempRoot = outDir;
    const scriptDir = path.join(outDir, "scripts");
    fs.mkdirSync(scriptDir, { recursive: true });
    fs.writeFileSync(
      path.join(outDir, "404.html"),
      "<a href=\"__BASE_PATH__/index.html\">" +
        "__GITHUB_PAGES_REDIRECT_STORAGE_KEY__",
      "utf8",
    );
    fs.writeFileSync(
      path.join(scriptDir, "github-pages-bootstrap.js"),
      "const key = \"__GITHUB_PAGES_REDIRECT_STORAGE_KEY__\"; const base = \"__BASE_PATH__\";",
      "utf8",
    );

    injectGitHubPagesPlaceholders(outDir, "/planner", GITHUB_PAGES_REDIRECT_STORAGE_KEY);

    expect(fs.readFileSync(path.join(outDir, "404.html"), "utf8")).toBe(
      `<a href="/planner/index.html">${GITHUB_PAGES_REDIRECT_STORAGE_KEY}`,
    );
    expect(
      fs.readFileSync(path.join(scriptDir, "github-pages-bootstrap.js"), "utf8"),
    ).toBe(
      `const key = "${GITHUB_PAGES_REDIRECT_STORAGE_KEY}"; const base = "/planner";`,
    );
  });
});
