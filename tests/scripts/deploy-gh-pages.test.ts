import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { SpawnSyncReturns } from "node:child_process";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildStaticSite,
  detectRepositorySlug,
  flattenBasePathDirectory,
  injectGitHubPagesPlaceholders,
  isUserOrOrgGitHubPagesRepository,
  parseGitHubRepository,
  resolvePublishBranch,
} from "../../scripts/deploy-gh-pages";
import { GITHUB_PAGES_REDIRECT_STORAGE_KEY } from "@/lib/github-pages";

describe("buildStaticSite", () => {
  it("runs pnpm build so the prebuild lifecycle executes on fresh clones", () => {
    const runSpy = vi.fn(
      (
        command: string,
        args: readonly string[],
        receivedEnv: NodeJS.ProcessEnv,
      ) => {
        expect(typeof command).toBe("string");
        expect(Array.isArray(args)).toBe(true);
        expect(receivedEnv.NODE_ENV).toBe("test");
      },
    );
    const env: NodeJS.ProcessEnv = {
      EXAMPLE_ENV: "value",
      NODE_ENV: "test",
    };

    buildStaticSite("pnpm", env, runSpy);

    expect(runSpy).toHaveBeenCalledWith("pnpm", ["run", "build"], env);
  });
});

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

    injectGitHubPagesPlaceholders(
      outDir,
      " planner ",
      GITHUB_PAGES_REDIRECT_STORAGE_KEY,
    );

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

describe("isUserOrOrgGitHubPagesRepository", () => {
  it("treats docs.github.io as a project page when owned by another organization", () => {
    expect(
      isUserOrOrgGitHubPagesRepository({
        repositoryOwnerSlug: "acme",
        repositoryNameSlug: "docs.github.io",
        fallbackSlug: "docs.github.io",
      }),
    ).toBe(false);
  });

  it("detects owner.github.io repositories as user or organization pages", () => {
    expect(
      isUserOrOrgGitHubPagesRepository({
        repositoryOwnerSlug: "acme",
        repositoryNameSlug: "acme.github.io",
      }),
    ).toBe(true);
  });

  it("matches owner.github.io repositories when the owner slug includes uppercase characters", () => {
    expect(
      isUserOrOrgGitHubPagesRepository({
        repositoryOwnerSlug: "EnollaTomazic",
        repositoryNameSlug: "enollatomazic.github.io",
      }),
    ).toBe(true);
  });
});

describe("detectRepositorySlug", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.GITHUB_REPOSITORY;
    delete process.env.BASE_PATH;
  });

  it("ignores BASE_PATH when preferBasePathEnv is false", () => {
    process.env.GITHUB_REPOSITORY = "octocat/planner";
    process.env.BASE_PATH = "custom-slug";

    const spawnMockImpl = vi.fn(
      (
        _command: string,
        _args: readonly string[],
      ): SpawnSyncReturns<string> => ({
        status: 1,
        stdout: "",
        stderr: "",
        pid: 0,
        output: [],
        signal: null,
      }),
    );
    const spawnMock =
      spawnMockImpl as unknown as typeof import("node:child_process").spawnSync;

    const { slug, ownerSlug } = detectRepositorySlug(spawnMock, {
      preferBasePathEnv: false,
    });

    expect(slug).toBe("planner");
    expect(ownerSlug).toBe("octocat");
    expect(spawnMockImpl).not.toHaveBeenCalled();
  });

  it("skips the base path when the origin remote targets a user GitHub Pages repository", () => {
    delete process.env.GITHUB_REPOSITORY;
    delete process.env.BASE_PATH;

    const spawnMockImpl = vi.fn(
      (
        command: string,
        args: readonly string[],
      ): SpawnSyncReturns<string> => {
        if (
          command === "git" &&
          args[0] === "config" &&
          args[1] === "--get" &&
          args[2] === "remote.origin.url"
        ) {
          return {
            status: 0,
            stdout: "git@github.com:octocat/octocat.github.io.git\n",
            stderr: "",
            pid: 0,
            output: [],
            signal: null,
          } satisfies SpawnSyncReturns<string>;
        }

        return {
          status: 1,
          stdout: "",
          stderr: "",
          pid: 0,
          output: [],
          signal: null,
        } satisfies SpawnSyncReturns<string>;
      },
    );
    const spawnMock = spawnMockImpl as unknown as typeof import("node:child_process").spawnSync;

    const { slug, ownerSlug } = detectRepositorySlug(spawnMock);
    expect(spawnMockImpl).toHaveBeenCalledWith(
      "git",
      ["config", "--get", "remote.origin.url"],
      expect.objectContaining({ stdio: ["ignore", "pipe", "ignore"] }),
    );
    expect(slug).toBe("octocat.github.io");
    expect(ownerSlug).toBe("octocat");

    const { owner: repositoryOwnerSlug, name: repositorySlug } = parseGitHubRepository(
      process.env.GITHUB_REPOSITORY,
    );
    const isUserOrOrg = isUserOrOrgGitHubPagesRepository({
      repositoryOwnerSlug: repositoryOwnerSlug ?? ownerSlug,
      repositoryNameSlug: repositorySlug,
      fallbackSlug: slug,
    });

    const shouldUseBasePath = slug.length > 0 && !isUserOrOrg;
    expect(isUserOrOrg).toBe(true);
    expect(shouldUseBasePath).toBe(false);
  });

  it("treats repository owner casing as case-insensitive for user GitHub Pages deployments", () => {
    process.env.GITHUB_REPOSITORY = "EnollaTomazic/EnollaTomazic.github.io";
    delete process.env.BASE_PATH;

    const spawnMockImpl = vi.fn(
      (
        command: string,
        args: readonly string[],
      ): SpawnSyncReturns<string> => {
        if (
          command === "git" &&
          args[0] === "config" &&
          args[1] === "--get" &&
          args[2] === "remote.origin.url"
        ) {
          return {
            status: 0,
            stdout: "git@github.com:EnollaTomazic/EnollaTomazic.github.io.git\n",
            stderr: "",
            pid: 0,
            output: [],
            signal: null,
          } satisfies SpawnSyncReturns<string>;
        }

        return {
          status: 1,
          stdout: "",
          stderr: "",
          pid: 0,
          output: [],
          signal: null,
        } satisfies SpawnSyncReturns<string>;
      },
    );
    const spawnMock =
      spawnMockImpl as unknown as typeof import("node:child_process").spawnSync;

    const { slug, ownerSlug } = detectRepositorySlug(spawnMock);

    expect(slug?.toLowerCase()).toBe("enollatomazic.github.io");
    expect(ownerSlug?.toLowerCase()).toBe("enollatomazic");

    const { owner: repositoryOwnerSlug, name: repositorySlug } = parseGitHubRepository(
      process.env.GITHUB_REPOSITORY,
    );

    const isUserOrOrg = isUserOrOrgGitHubPagesRepository({
      repositoryOwnerSlug: repositoryOwnerSlug ?? ownerSlug,
      repositoryNameSlug: repositorySlug,
      fallbackSlug: slug,
    });

    const shouldUseBasePath = slug.length > 0 && !isUserOrOrg;
    expect(isUserOrOrg).toBe(true);
    expect(shouldUseBasePath).toBe(false);
  });
});

describe("resolvePublishBranch", () => {
  const emptyEnv: NodeJS.ProcessEnv = {};

  it("prefers the detected default branch when it matches the fallback", () => {
    const branch = resolvePublishBranch(
      emptyEnv,
      { fallbackBranch: "main" },
      () => "main",
    );

    expect(branch).toBe("main");
  });

  it("throws when the detected default branch differs from the fallback", () => {
    expect(() =>
      resolvePublishBranch(
        emptyEnv,
        { fallbackBranch: "gh-pages" },
        () => "main",
      ),
    ).toThrow(/GitHub Pages branch/);
  });

  it("falls back to the provided branch when no default branch is detected", () => {
    const branch = resolvePublishBranch(
      emptyEnv,
      { fallbackBranch: "gh-pages" },
      () => undefined,
    );

    expect(branch).toBe("gh-pages");
  });
});
