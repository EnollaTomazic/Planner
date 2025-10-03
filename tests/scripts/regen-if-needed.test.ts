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
  const originalManifest = fs.readFileSync(manifestPath, "utf8");

  afterEach(() => {
    fs.writeFileSync(manifestPath, originalManifest);
  });

  it("confirms the manifest is valid without requiring regeneration", async () => {
    const minimalManifest = [
      "export const galleryPayload = {} as const;",
      "export const galleryPreviewRoutes = [] as const;",
      "export const galleryPreviewModules = {} as const;",
      "",
    ].join("\n");

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

    warnSpy.mockRestore();
  });

  it("throws in CI environments when the manifest is malformed", async () => {
    const regenModule = await importRegenModule("1");

    fs.writeFileSync(manifestPath, "{\n  \"broken\": true\n}\n");

    await expect(
      regenModule.ensureGalleryManifestIntegrity(),
    ).rejects.toThrow(
      "Gallery manifest appears to contain raw JSON. Run `pnpm run build-gallery` to regenerate src/components/gallery/generated-manifest.ts.",
    );
  });
});

