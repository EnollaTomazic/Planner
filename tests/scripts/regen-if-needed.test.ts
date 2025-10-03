import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("url", async () => {
  const pathModule = await import("node:path");

  const toHref = (value: string | URL): string =>
    typeof value === "string" ? value : value.href;

  return {
    fileURLToPath: (value: string | URL) =>
      new URL(toHref(value), "file:").pathname,
    pathToFileURL: (value: string) =>
      new URL(pathModule.resolve(value), "file:"),
  };
});

const REQUIRED_GENERATOR_COMMANDS = [
  "pnpm run regen-ui",
  "pnpm run regen-feature",
  "pnpm run build-gallery-usage",
  "pnpm run generate-themes",
  "pnpm run generate-tokens",
];

const originalCI = process.env.CI;

async function importRegenModule(ciValue?: string) {
  vi.resetModules();

  if (ciValue === undefined) {
    delete process.env.CI;
  } else {
    process.env.CI = ciValue;
  }

  return import("../../scripts/regen-if-needed");
}

afterAll(() => {
  if (originalCI === undefined) {
    delete process.env.CI;
  } else {
    process.env.CI = originalCI;
  }
});

function createTempRepo(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "regen-if-needed-"));
  execSync("git init", { cwd: dir, stdio: "ignore" });
  execSync('git config user.email "ci@example.com"', {
    cwd: dir,
    stdio: "ignore",
  });
  execSync('git config user.name "CI"', { cwd: dir, stdio: "ignore" });

  fs.writeFileSync(path.join(dir, "README.md"), "initial contents\n");
  execSync("git add README.md", { cwd: dir, stdio: "ignore" });
  execSync("git commit -m 'initial'", { cwd: dir, stdio: "ignore" });

  return dir;
}

describe("regen-if-needed CI validations", () => {
  let repoDir: string;
  let regenModule: typeof import("../../scripts/regen-if-needed");

  beforeEach(async () => {
    regenModule = await importRegenModule();
    repoDir = createTempRepo();
  });

  afterEach(() => {
    if (repoDir && fs.existsSync(repoDir)) {
      fs.rmSync(repoDir, { recursive: true, force: true });
    }
  });

  it("includes all required generator commands", () => {
    const commands = regenModule.generatorValidations.map(
      (entry) => entry.command,
    );
    expect(commands).toEqual(REQUIRED_GENERATOR_COMMANDS);
  });

  it("passes when the working tree stays clean", () => {
    expect(() =>
      regenModule.validateGenerators(
        [
          {
            name: "noop",
            command: "node -e \"process.exit(0)\"",
          },
        ],
        { cwd: repoDir },
      ),
    ).not.toThrow();
  });

  it("fails fast when the repository is already dirty", () => {
    fs.writeFileSync(path.join(repoDir, "dirty.txt"), "dirty\n");

    expect(() =>
      regenModule.validateGenerators(
        [
          {
            name: "noop",
            command: 'node -e "process.exit(0)"',
          },
        ],
        { cwd: repoDir },
      ),
    ).toThrowErrorMatchingInlineSnapshot(`
[Error: noop validation requires a clean working tree. Stash or commit your changes before rerunning.\n\n?? dirty.txt]
`);
  });

  it("fails when a generator leaves the tree dirty", () => {
    expect(() =>
      regenModule.validateGenerators(
        [
          {
            name: "generated", // matches coverage expectation
            command:
              "node -e \"require('fs').writeFileSync('generated.txt', 'contents')\"",
          },
        ],
        { cwd: repoDir },
      ),
    ).toThrowErrorMatchingInlineSnapshot(`
[Error: generated outputs are stale. Run \`node -e \"require('fs').writeFileSync('generated.txt', 'contents')\"\` and commit the generated files.\n\n?? generated.txt]
`);
  });
});

describe("gallery manifest validation", () => {
  const repoRoot = path.resolve(__dirname, "..", "..");
  const manifestPath = path.join(
    repoRoot,
    "src/components/gallery/generated-manifest.ts",
  );
  const cachePath = path.join(repoRoot, "scripts", ".cache");
  const usageManifestPath = path.join(
    cachePath,
    "build-gallery-usage.json",
  );
  const originalManifest = fs.readFileSync(manifestPath, "utf8");
  const minimalManifest = [
    "export const galleryPayload = {} as const;",
    "export const galleryPreviewRoutes = [] as const;",
    "export const galleryPreviewModules = {} as const;",
    "",
  ].join("\n");

  let pnpmStubDir: string | null = null;
  let originalPathEnv: string | undefined;
  let originalManifestEnv: string | undefined;
  let originalManifestContentEnv: string | undefined;
  let usageManifestExisted = false;
  let usageManifestSnapshot: string | null = null;

  beforeEach(() => {
    usageManifestExisted = fs.existsSync(usageManifestPath);
    usageManifestSnapshot = usageManifestExisted
      ? fs.readFileSync(usageManifestPath, "utf8")
      : null;

    pnpmStubDir = fs.mkdtempSync(path.join(os.tmpdir(), "pnpm-stub-"));
    const stubPath = path.join(pnpmStubDir, "pnpm");
    const stubSource = [
      "#!/usr/bin/env node",
      "const fs = require(\"node:fs\");",
      "const path = require(\"node:path\");",
      "",
      "const manifestPath = process.env.GALLERY_MANIFEST_PATH;",
      "const manifestSource = process.env.GALLERY_MANIFEST_CONTENT || \"\";",
      "",
      "if (!manifestPath) {",
      "  process.stderr.write(\"GALLERY_MANIFEST_PATH is not set\\n\");",
      "  process.exit(1);",
      "}",
      "",
      "fs.mkdirSync(path.dirname(manifestPath), { recursive: true });",
      "fs.writeFileSync(manifestPath, manifestSource);",
      "",
      "process.exit(0);",
      "",
    ].join("\n");
    fs.writeFileSync(stubPath, stubSource);
    fs.chmodSync(stubPath, 0o755);

    originalPathEnv = process.env.PATH;
    process.env.PATH = pnpmStubDir
      ? `${pnpmStubDir}:${originalPathEnv ?? ""}`
      : originalPathEnv;

    originalManifestEnv = process.env.GALLERY_MANIFEST_PATH;
    process.env.GALLERY_MANIFEST_PATH = manifestPath;

    originalManifestContentEnv = process.env.GALLERY_MANIFEST_CONTENT;
    process.env.GALLERY_MANIFEST_CONTENT = minimalManifest;
  });

  afterEach(() => {
    if (pnpmStubDir) {
      fs.rmSync(pnpmStubDir, { recursive: true, force: true });
      pnpmStubDir = null;
    }

    if (originalPathEnv === undefined) {
      delete process.env.PATH;
    } else {
      process.env.PATH = originalPathEnv;
    }

    if (originalManifestEnv === undefined) {
      delete process.env.GALLERY_MANIFEST_PATH;
    } else {
      process.env.GALLERY_MANIFEST_PATH = originalManifestEnv;
    }

    if (originalManifestContentEnv === undefined) {
      delete process.env.GALLERY_MANIFEST_CONTENT;
    } else {
      process.env.GALLERY_MANIFEST_CONTENT = originalManifestContentEnv;
    }

    fs.writeFileSync(manifestPath, originalManifest);

    if (usageManifestExisted) {
      if (usageManifestSnapshot !== null) {
        fs.writeFileSync(usageManifestPath, usageManifestSnapshot);
      }
    } else if (fs.existsSync(usageManifestPath)) {
      fs.rmSync(usageManifestPath, { force: true });
    }
  });

  it("confirms the manifest is valid without requiring regeneration", async () => {
    fs.writeFileSync(manifestPath, minimalManifest);

    const regenModule = await importRegenModule();
    await expect(
      regenModule.ensureGalleryManifestIntegrity(),
    ).resolves.toBe(false);
  });

  it("requests regeneration locally when the manifest is malformed", async () => {
    const regenModule = await importRegenModule();
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    fs.writeFileSync(manifestPath, "{\n  \"broken\": true\n}\n");

    await expect(
      regenModule.ensureGalleryManifestIntegrity(),
    ).resolves.toBe(true);

    const regeneratedManifest = fs.readFileSync(manifestPath, "utf8");
    expect(regeneratedManifest).toContain("export const galleryPayload");

    warnSpy.mockRestore();
  });

  it("regenerates the manifest and updates the cache manifest locally", async () => {
    const regenModule = await importRegenModule();

    fs.writeFileSync(manifestPath, "{\n  \"broken\": true\n}\n");
    if (fs.existsSync(usageManifestPath)) {
      fs.rmSync(usageManifestPath, { force: true });
    }

    await expect(
      regenModule.ensureGalleryManifestIntegrity(),
    ).resolves.toBe(true);

    const regeneratedManifest = fs.readFileSync(manifestPath, "utf8");
    expect(regeneratedManifest).toContain("export const galleryPreviewModules");

    expect(fs.existsSync(usageManifestPath)).toBe(true);
    const usageManifest = JSON.parse(
      fs.readFileSync(usageManifestPath, "utf8"),
    ) as Record<string, unknown>;
    expect(Object.keys(usageManifest).length).toBeGreaterThan(0);
  });

  it("throws locally when regeneration cannot repair a malformed manifest", async () => {
    const regenModule = await importRegenModule();
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    const malformedManifest = "{\n  \"broken\": true\n}\n";
    const stillBrokenManifest = "{\n  \"stillBroken\": true\n}\n";

    fs.writeFileSync(manifestPath, malformedManifest);

    const previousManifestContentEnv = process.env.GALLERY_MANIFEST_CONTENT;
    process.env.GALLERY_MANIFEST_CONTENT = stillBrokenManifest;

    try {
      await expect(
        regenModule.ensureGalleryManifestIntegrity(),
      ).rejects.toThrow(
        "Gallery manifest appears to contain raw JSON. Run `pnpm run build-gallery-usage` to regenerate src/components/gallery/generated-manifest.ts.",
      );

      const manifestAfterAttempt = fs.readFileSync(manifestPath, "utf8");
      expect(manifestAfterAttempt).toBe(stillBrokenManifest);
      expect(warnSpy).toHaveBeenCalled();
    } finally {
      warnSpy.mockRestore();
      if (previousManifestContentEnv === undefined) {
        delete process.env.GALLERY_MANIFEST_CONTENT;
      } else {
        process.env.GALLERY_MANIFEST_CONTENT = previousManifestContentEnv;
      }
    }
  });

  it("throws in CI environments when the manifest is malformed", async () => {
    const regenModule = await importRegenModule("1");

    fs.writeFileSync(manifestPath, "{\n  \"broken\": true\n}\n");

    await expect(
      regenModule.ensureGalleryManifestIntegrity(),
    ).rejects.toThrow(
      "Gallery manifest appears to contain raw JSON. Run `pnpm run build-gallery-usage` to regenerate src/components/gallery/generated-manifest.ts.",
    );
  });

  it("attempts regeneration locally when the manifest is malformed", async () => {
    const repoRoot = path.resolve(__dirname, "..", "..");
    const scriptEntry = path.join(repoRoot, "scripts", "regen-if-needed.ts");
    const galleryManifestFile = path.join(
      repoRoot,
      "src/components/gallery/generated-manifest.ts",
    );
    const validManifest = [
      "export const galleryPayload = {} as const;",
      "export const galleryPreviewRoutes = [] as const;",
      "export const galleryPreviewModules = {} as const;",
      "",
    ].join("\n");

    const originalArgv = [...process.argv];
    const originalCi = process.env.CI;

    vi.resetModules();

    const execSyncMock = vi.fn();
    const fgMock = vi.fn(async () => [] as string[]);
    const warnMock = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    const logMock = vi
      .spyOn(console, "log")
      .mockImplementation(() => undefined);
    const errorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const exitMock = vi
      .spyOn(process, "exit")
      .mockImplementation((() => undefined) as never);

    let manifestReads = 0;
    const readFileMock = vi.fn(async (file: string) => {
      if (file === galleryManifestFile) {
        manifestReads += 1;
        if (manifestReads === 1) {
          return "{\n  \"broken\": true\n}\n";
        }
        return validManifest;
      }
      return "{}";
    });

    const statMock = vi.fn(async () => ({ mtimeMs: Date.now() }));
    const writeFileMock = vi.fn(async () => undefined);
    const mkdirMock = vi.fn(async () => undefined);

    class MockMultiBar {
      create = vi.fn(() => ({ increment: vi.fn() }));
      stop = vi.fn();
    }

    vi.doMock("fs", () => ({
      promises: {
        readFile: readFileMock,
        stat: statMock,
        writeFile: writeFileMock,
        mkdir: mkdirMock,
      },
      default: {
        promises: {
          readFile: readFileMock,
          stat: statMock,
          writeFile: writeFileMock,
          mkdir: mkdirMock,
        },
      },
    }));
    vi.doMock("fast-glob", () => ({
      default: fgMock,
    }));
    vi.doMock("cli-progress", () => ({
      MultiBar: MockMultiBar,
      Presets: { shades_grey: {} },
    }));
    vi.doMock("node:child_process", () => ({
      execSync: execSyncMock,
      default: { execSync: execSyncMock },
    }));

    delete process.env.CI;
    process.argv = [
      originalArgv[0],
      scriptEntry,
      ...originalArgv.slice(2),
    ];

    try {
      await import("../../scripts/regen-if-needed");
      await new Promise((resolve) => setImmediate(resolve));

      expect(execSyncMock).toHaveBeenCalledWith(
        "pnpm run build-gallery-usage",
        expect.objectContaining({ stdio: "inherit" }),
      );
      expect(manifestReads).toBeGreaterThanOrEqual(2);
      expect(warnMock).toHaveBeenCalled();
      expect(exitMock).not.toHaveBeenCalled();
    } finally {
      warnMock.mockRestore();
      logMock.mockRestore();
      errorMock.mockRestore();
      exitMock.mockRestore();

      process.argv = originalArgv;
      if (originalCi === undefined) {
        delete process.env.CI;
      } else {
        process.env.CI = originalCi;
      }

      vi.doUnmock("fs");
      vi.doUnmock("fast-glob");
      vi.doUnmock("cli-progress");
      vi.doUnmock("node:child_process");
      vi.resetModules();
    }
  });
});

