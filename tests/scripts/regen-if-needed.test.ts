import { execSync } from "node:child_process";
import fs from "node:fs";
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

describe("regen-if-needed local run", () => {
  const realArgv = [...process.argv];
  const realCi = process.env.CI;

  beforeEach(() => {
    vi.resetModules();
    process.env.CI = "";
    process.argv[1] = path.join(
      __dirname,
      "../../scripts/regen-if-needed.ts",
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.argv = [...realArgv];
    process.env.CI = realCi;
    vi.unmock("fast-glob");
    vi.unmock("cli-progress");
    vi.unmock("node:child_process");
    vi.unmock("fs");
  });

  it("regenerates when a manifest cannot be parsed", async () => {
    const execMock = vi.fn();

    const globMock = vi.fn(async (patterns: unknown, options?: { cwd?: string }) => {
      if (
        Array.isArray(patterns) &&
        patterns.includes("**/*.{ts,tsx}") &&
        options?.cwd?.includes("src/components/ui")
      ) {
        return [path.join(options.cwd ?? "", "Button.tsx")];
      }
      return [];
    });

    const statsResult = { mtimeMs: 123 };
    const readFileMock = vi
      .fn()
      .mockImplementation(async (file: string) => {
        if (file.endsWith("generate-ui-index.json")) {
          return "not-json";
        }
        if (file.endsWith("generate-themes.json") || file.endsWith("generate-tokens.json")) {
          return JSON.stringify({});
        }
        return "{}";
      });
    const statMock = vi.fn().mockResolvedValue(statsResult);
    const mkdirMock = vi.fn().mockResolvedValue(undefined);
    const writeFileMock = vi.fn().mockResolvedValue(undefined);

    const progressIncrement = vi.fn();
    const progressCreate = vi.fn(() => ({ increment: progressIncrement }));
    const progressStop = vi.fn();
    const progressCtor = vi.fn(() => ({ create: progressCreate, stop: progressStop }));

    vi.doMock("node:child_process", () => ({
      __esModule: true as const,
      default: { execSync: execMock },
      execSync: execMock,
    }));
    vi.doMock("fast-glob", () => ({ default: globMock }));
    vi.doMock("cli-progress", () => ({
      MultiBar: progressCtor,
      Presets: { shades_grey: {} },
    }));
    vi.doMock("fs", () => ({
      __esModule: true as const,
      promises: {
        readFile: readFileMock,
        stat: statMock,
        mkdir: mkdirMock,
        writeFile: writeFileMock,
      },
      default: {
        promises: {
          readFile: readFileMock,
          stat: statMock,
          mkdir: mkdirMock,
          writeFile: writeFileMock,
        },
      },
    }));

    await import("../../scripts/regen-if-needed");
    await new Promise((resolve) => setImmediate(resolve));

    expect(execMock).toHaveBeenCalledWith("pnpm run regen-ui", expect.any(Object));
    expect(readFileMock).toHaveBeenCalledWith(expect.stringContaining("generate-ui-index.json"), "utf8");
    expect(progressCtor).toHaveBeenCalled();
  });
});
