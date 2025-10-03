import * as childProcess from "node:child_process";
import fs, { promises as fsPromises } from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

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

let regenModule: typeof import("../../scripts/regen-if-needed");

const REQUIRED_GENERATOR_COMMANDS = [
  "pnpm run regen-ui",
  "pnpm run regen-feature",
  "pnpm run build-gallery-usage",
  "pnpm run generate-themes",
  "pnpm run generate-tokens",
];

function createTempRepo(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "regen-if-needed-"));
  childProcess.execSync("git init", { cwd: dir, stdio: "ignore" });
  childProcess.execSync('git config user.email "ci@example.com"', {
    cwd: dir,
    stdio: "ignore",
  });
  childProcess.execSync('git config user.name "CI"', {
    cwd: dir,
    stdio: "ignore",
  });

  fs.writeFileSync(path.join(dir, "README.md"), "initial contents\n");
  childProcess.execSync("git add README.md", { cwd: dir, stdio: "ignore" });
  childProcess.execSync("git commit -m 'initial'", { cwd: dir, stdio: "ignore" });

  return dir;
}

describe("regen-if-needed CI validations", () => {
  let repoDir: string;

  beforeAll(async () => {
    regenModule = await import("../../scripts/regen-if-needed");
  });

  beforeEach(() => {
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
            command: 'node -e "process.exit(0)"',
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
              'node -e "require(\'fs\').writeFileSync(\'generated.txt\', \'contents\')"',
          },
        ],
        { cwd: repoDir },
      ),
    ).toThrowErrorMatchingInlineSnapshot(`
[Error: generated outputs are stale. Run \`node -e \"require('fs').writeFileSync('generated.txt', 'contents')\"\` and commit the generated files.\n\n?? generated.txt]
`);
  });
});

describe("gallery manifest self-healing", () => {
  const manifestPath = path.resolve(
    process.cwd(),
    "src/components/gallery/generated-manifest.ts",
  );

  it("rebuilds the manifest when validation fails locally", async () => {
    const regenModule = await import("../../scripts/regen-if-needed");

    const runCommand = vi.fn();

    const originalReadFile = fsPromises.readFile.bind(fsPromises);
    let readCount = 0;
    const readFileSpy = vi
      .spyOn(fsPromises, "readFile")
      .mockImplementation(async (file: unknown, encoding?: unknown) => {
        const resolvedPath =
          typeof file === "string"
            ? path.resolve(file)
            : file instanceof URL
            ? file.pathname
            : undefined;

        if (resolvedPath && path.resolve(resolvedPath) === manifestPath) {
          if (readCount === 0) {
            readCount += 1;
            throw new Error("missing manifest");
          }
          readCount += 1;
          return [
            "export const galleryPayload = {} as const;",
            "export const galleryPreviewRoutes = {} as const;",
            "export const galleryPreviewModules = {} as const;",
          ].join("\n");
        }

        return originalReadFile(
          file as Parameters<typeof fsPromises.readFile>[0],
          encoding as Parameters<typeof fsPromises.readFile>[1],
        );
      });

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const regenerated = await regenModule.ensureGalleryManifest({
      runCommand,
    });

    expect(regenerated).toBe(true);
    expect(runCommand).toHaveBeenCalledTimes(1);
    expect(runCommand).toHaveBeenCalledWith("pnpm run build-gallery-usage");

    warnSpy.mockRestore();
    readFileSpy.mockRestore();
  });
});
