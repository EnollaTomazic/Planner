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

const GALLERY_USAGE_COMMAND = "pnpm run build-gallery-usage";

const REQUIRED_GENERATOR_COMMANDS = [
  "pnpm run regen-ui",
  "pnpm run regen-feature",
  GALLERY_USAGE_COMMAND,
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
  // Skip hooks so nested commits created during tests don't trigger project
  // hooks when the suite runs inside a larger git operation (e.g. Husky).
  execSync("git commit --no-verify -m 'initial'", {
    cwd: dir,
    stdio: "ignore",
  });

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

  it("allows running when the repository is already dirty", () => {
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
    ).not.toThrow();
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

  it("fails when generators introduce new changes in a dirty tree", () => {
    fs.writeFileSync(path.join(repoDir, "dirty.txt"), "dirty\n");

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
    "src/components/gallery/generated-manifest.g.ts",
  );
  const manifestPayloadPath = path.join(
    repoRoot,
    "src/components/gallery/generated-manifest.ts",
  );
  const cachePath = path.join(repoRoot, "scripts", ".cache");
  const usageManifestPath = path.join(
    cachePath,
    "build-gallery-usage.json",
  );
  const originalManifest = fs.readFileSync(manifestPath, "utf8");
  const originalManifestPayload = fs.readFileSync(manifestPayloadPath, "utf8");
  const minimalManifest = [
    "// Auto-generated by scripts/build-gallery-usage.ts",
    "// checksum: 00000000",
    "import type { Manifest } from './manifest.schema'",
    "import {",
    "  galleryPayload,",
    "  galleryPreviewModules,",
    "  galleryPreviewRoutes,",
    "} from './generated-manifest'",
    "",
    "export const manifest = {",
    "  galleryPayload,",
    "  galleryPreviewModules,",
    "  galleryPreviewRoutes,",
    "} as const satisfies Manifest",
    "",
    "export { galleryPayload, galleryPreviewModules, galleryPreviewRoutes }",
    "",
    "export default manifest",
    "",
  ].join("\n");
  const minimalManifestPayload = [
    "export const galleryPayload = { sections: [] } as const;",
    "export const galleryPreviewModules = {} as const;",
    "export const galleryPreviewRoutes = [] as const;",
    "",
  ].join("\n");

  let pnpmStubDir: string | null = null;
  let originalPathEnv: string | undefined;
  let originalManifestEnv: string | undefined;
  let originalManifestContentEnv: string | undefined;
  let originalManifestPayloadEnv: string | undefined;
  let originalManifestPayloadContentEnv: string | undefined;
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
      "const manifestPayloadPath = process.env.GALLERY_MANIFEST_PAYLOAD_PATH;",
      "const manifestPayloadSource =",
      "  process.env.GALLERY_MANIFEST_PAYLOAD_CONTENT || \"\";",
      "",
      "if (!manifestPath) {",
      "  process.stderr.write(\"GALLERY_MANIFEST_PATH is not set\\n\");",
      "  process.exit(1);",
      "}",
      "",
      "fs.mkdirSync(path.dirname(manifestPath), { recursive: true });",
      "fs.writeFileSync(manifestPath, manifestSource);",
      "",
      "if (manifestPayloadPath) {",
      "  fs.mkdirSync(path.dirname(manifestPayloadPath), { recursive: true });",
      "  fs.writeFileSync(manifestPayloadPath, manifestPayloadSource);",
      "}",
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

    originalManifestPayloadEnv = process.env.GALLERY_MANIFEST_PAYLOAD_PATH;
    process.env.GALLERY_MANIFEST_PAYLOAD_PATH = manifestPayloadPath;

    originalManifestPayloadContentEnv =
      process.env.GALLERY_MANIFEST_PAYLOAD_CONTENT;
    process.env.GALLERY_MANIFEST_PAYLOAD_CONTENT = minimalManifestPayload;
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

    if (originalManifestPayloadEnv === undefined) {
      delete process.env.GALLERY_MANIFEST_PAYLOAD_PATH;
    } else {
      process.env.GALLERY_MANIFEST_PAYLOAD_PATH = originalManifestPayloadEnv;
    }

    if (originalManifestPayloadContentEnv === undefined) {
      delete process.env.GALLERY_MANIFEST_PAYLOAD_CONTENT;
    } else {
      process.env.GALLERY_MANIFEST_PAYLOAD_CONTENT =
        originalManifestPayloadContentEnv;
    }

    fs.writeFileSync(manifestPath, originalManifest);
    fs.writeFileSync(manifestPayloadPath, originalManifestPayload);

    if (usageManifestExisted) {
      if (usageManifestSnapshot !== null) {
        fs.writeFileSync(usageManifestPath, usageManifestSnapshot);
      }
    } else if (fs.existsSync(usageManifestPath)) {
      fs.rmSync(usageManifestPath, { force: true });
    }
  });

  function mockManifestReads(options: {
    entrypoint?: readonly string[];
    payload?: readonly string[];
  }): () => void {
    const sequences = new Map<string, string[]>();

    if (options.entrypoint) {
      sequences.set(manifestPath, [...options.entrypoint]);
    }

    if (options.payload) {
      sequences.set(manifestPayloadPath, [...options.payload]);
    }

    if (sequences.size === 0) {
      return () => undefined;
    }

    const originalReadFile = fs.promises.readFile;

    const spy = vi
      .spyOn(fs.promises, "readFile")
      .mockImplementation(async (file: unknown, encoding: unknown) => {
        const key =
          typeof file === "string"
            ? file
            : Buffer.isBuffer(file)
              ? file.toString()
              : String(file);
        const sequence = sequences.get(key);

        if (sequence && sequence.length > 0) {
          if (sequence.length > 1) {
            return sequence.shift()!;
          }

          return sequence[0]!;
        }

        return originalReadFile.call(
          fs.promises,
          file as Parameters<typeof originalReadFile>[0],
          encoding as Parameters<typeof originalReadFile>[1],
        );
      });

    return () => {
      spy.mockRestore();
    };
  }

  it("confirms the manifest is valid without requiring regeneration", async () => {
    fs.writeFileSync(manifestPath, minimalManifest);
    fs.writeFileSync(manifestPayloadPath, minimalManifestPayload);

    const regenModule = await importRegenModule();
    await expect(
      regenModule.ensureGalleryManifestIntegrity(),
    ).resolves.toBe(false);
  });

  it("regenerates the manifest in CI when it is missing", async () => {
    fs.rmSync(manifestPath, { force: true });

    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    try {
      const regenModule = await importRegenModule("1");
      await expect(
        regenModule.ensureGalleryManifestIntegrity(),
      ).resolves.toBe(true);

      const regeneratedManifest = fs.readFileSync(manifestPath, "utf8");
      expect(regeneratedManifest).toBe(minimalManifest);
      expect(warnSpy).toHaveBeenCalledWith(
        `Missing gallery manifest. Run \`${GALLERY_USAGE_COMMAND}\` to regenerate src/components/gallery/generated-manifest.g.ts.\nRegenerating gallery manifest with \`${GALLERY_USAGE_COMMAND}\` (CI fallback).`,
      );
    } finally {
      warnSpy.mockRestore();
    }
  });

  it("requests regeneration locally when the manifest is malformed", async () => {
    const regenModule = await importRegenModule();
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    const restoreRead = mockManifestReads({
      entrypoint: ["{\n  \"broken\": true\n}\n", minimalManifest],
    });

    try {
      await expect(
        regenModule.ensureGalleryManifestIntegrity(),
      ).resolves.toBe(true);

      const regeneratedManifest = fs.readFileSync(manifestPath, "utf8");
      expect(regeneratedManifest).toBe(minimalManifest);
    } finally {
      restoreRead();
      warnSpy.mockRestore();
    }
  });

  it("requests regeneration locally when the manifest payload is malformed", async () => {
    const regenModule = await importRegenModule();
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    fs.writeFileSync(manifestPath, minimalManifest);
    const restoreRead = mockManifestReads({
      payload: ["{\n  \"broken\": true\n}\n", minimalManifestPayload],
    });

    try {
      await expect(
        regenModule.ensureGalleryManifestIntegrity(),
      ).resolves.toBe(true);

      const regeneratedPayload = fs.readFileSync(manifestPayloadPath, "utf8");
      expect(regeneratedPayload).toBe(minimalManifestPayload);
    } finally {
      restoreRead();
      warnSpy.mockRestore();
    }
  });

  it("regenerates the manifest and updates the cache manifest locally", async () => {
    const regenModule = await importRegenModule();

    const restoreRead = mockManifestReads({
      entrypoint: ["{\n  \"broken\": true\n}\n", minimalManifest],
    });
    if (fs.existsSync(usageManifestPath)) {
      fs.rmSync(usageManifestPath, { force: true });
    }

    try {
      await expect(
        regenModule.ensureGalleryManifestIntegrity(),
      ).resolves.toBe(true);

      const regeneratedManifest = fs.readFileSync(manifestPath, "utf8");
      expect(regeneratedManifest).toBe(minimalManifest);

      const regeneratedPayload = fs.readFileSync(manifestPayloadPath, "utf8");
      expect(regeneratedPayload).toBe(minimalManifestPayload);

      expect(fs.existsSync(usageManifestPath)).toBe(true);
      const usageManifest = JSON.parse(
        fs.readFileSync(usageManifestPath, "utf8"),
      ) as Record<string, unknown>;
      expect(Object.keys(usageManifest).length).toBeGreaterThan(0);
    } finally {
      restoreRead();
    }
  });

  it("throws locally when regeneration cannot repair a raw JSON manifest payload", async () => {
    const regenModule = await importRegenModule();
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    fs.writeFileSync(manifestPath, minimalManifest);
    fs.writeFileSync(manifestPayloadPath, minimalManifestPayload);

    const restoreRead = mockManifestReads({
      payload: ["{\n  \"broken\": true\n}\n"],
    });

    try {
      await expect(
        regenModule.ensureGalleryManifestIntegrity(),
      ).rejects.toThrow(
        `Gallery manifest payload appears to contain raw JSON. Run \`${GALLERY_USAGE_COMMAND}\` to regenerate src/components/gallery/generated-manifest.ts.`,
      );

      const payloadAfterAttempt = fs.readFileSync(manifestPayloadPath, "utf8");
      expect(payloadAfterAttempt).toBe(minimalManifestPayload);
      expect(warnSpy).toHaveBeenCalled();
    } finally {
      warnSpy.mockRestore();
      restoreRead();
    }
  });

  it("regenerates raw JSON manifests in CI environments", async () => {
    const regenModule = await importRegenModule("1");
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    const restoreRead = mockManifestReads({
      entrypoint: ["{\n  \"broken\": true\n}\n", minimalManifest],
    });

    try {
      await expect(
        regenModule.ensureGalleryManifestIntegrity(),
      ).resolves.toBe(true);

      const regeneratedManifest = fs.readFileSync(manifestPath, "utf8");
      expect(regeneratedManifest).toBe(minimalManifest);
      const regeneratedPayload = fs.readFileSync(manifestPayloadPath, "utf8");
      expect(regeneratedPayload).toBe(minimalManifestPayload);
      expect(warnSpy).toHaveBeenCalledWith(
        `Gallery manifest entrypoint appears to contain raw JSON. Run \`${GALLERY_USAGE_COMMAND}\` to regenerate src/components/gallery/generated-manifest.g.ts.\nRegenerating gallery manifest with \`${GALLERY_USAGE_COMMAND}\` (CI fallback).`,
      );
    } finally {
      warnSpy.mockRestore();
      restoreRead();
    }
  });

  it("throws in CI when regeneration cannot repair a raw JSON manifest payload", async () => {
    const regenModule = await importRegenModule("1");
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    fs.writeFileSync(manifestPath, minimalManifest);
    fs.writeFileSync(manifestPayloadPath, minimalManifestPayload);

    const restoreRead = mockManifestReads({
      payload: ["{\n  \"broken\": true\n}\n"],
    });

    try {
      await expect(
        regenModule.ensureGalleryManifestIntegrity(),
      ).rejects.toThrow(
        `Gallery manifest payload appears to contain raw JSON. Run \`${GALLERY_USAGE_COMMAND}\` to regenerate src/components/gallery/generated-manifest.ts.`,
      );
      expect(warnSpy).toHaveBeenCalledWith(
        `Gallery manifest payload appears to contain raw JSON. Run \`${GALLERY_USAGE_COMMAND}\` to regenerate src/components/gallery/generated-manifest.ts.\nRegenerating gallery manifest with \`${GALLERY_USAGE_COMMAND}\` (CI fallback).`,
      );
    } finally {
      warnSpy.mockRestore();
      restoreRead();
    }
  });

  it("attempts regeneration locally when the manifest is malformed", async () => {
    const repoRoot = path.resolve(__dirname, "..", "..");
    const scriptEntry = path.join(repoRoot, "scripts", "regen-if-needed.ts");
    const galleryManifestFile = path.join(
      repoRoot,
      "src/components/gallery/generated-manifest.g.ts",
    );
    const galleryManifestPayloadFile = path.join(
      repoRoot,
      "src/components/gallery/generated-manifest.ts",
    );
    const validManifest = minimalManifest;
    const validManifestPayload = minimalManifestPayload;

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
      if (file === galleryManifestPayloadFile) {
        return validManifestPayload;
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
        GALLERY_USAGE_COMMAND,
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

