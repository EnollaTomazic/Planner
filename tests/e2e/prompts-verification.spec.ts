import assert from "node:assert/strict";
import { execFile, type ExecFileException } from "node:child_process";
import { rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { test } from "./playwright";

const execFileAsync = promisify(execFile);
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const specDir = path.dirname(fileURLToPath(new URL(import.meta.url)));
const repoRoot = path.resolve(specDir, "..", "..");
const tempComponentName = "PlaywrightMissingPrompt";
const tempComponentPath = path.resolve(
  repoRoot,
  "src",
  "components",
  "ui",
  `${tempComponentName}.tsx`,
);

async function runVerifyPrompts() {
  return execFileAsync(pnpmCommand, ["run", "verify-prompts"], {
    cwd: repoRoot,
    env: { ...process.env },
    maxBuffer: 1024 * 1024 * 10,
  });
}

test("verify prompts succeed and surface missing demos", async () => {
  const projectName =
    process.env.PLAYWRIGHT_PROJECT_NAME ?? process.env.PW_TEST_PROJECT_NAME ?? process.env.PW_PROJECT ?? "";
  const shouldSkip = projectName !== "" && projectName !== "chromium";
  test.skip(shouldSkip, "CLI verification runs once per suite");

  const { stdout, stderr } = await runVerifyPrompts();

  assert.ok(stdout.includes("All components have prompt demos."));
  assert.ok(!stderr.includes("Missing prompt demos for components:"));

  await writeFile(
    tempComponentPath,
    [
      "export default function PlaywrightMissingPrompt() {",
      "  return null;",
      "}",
      "",
    ].join("\n"),
    "utf8",
  );

  try {
    const result = await runVerifyPrompts()
      .then(() => ({ status: "ok" as const }))
      .catch((execError) => ({
        status: "error" as const,
        error: execError as ExecFileException & { stdout?: string; stderr?: string },
      }));

    assert.strictEqual(result.status, "error", "verify-prompts should fail when demos are missing");

    const errorOutput = result.status === "error" ? result.error.stderr ?? "" : "";

    assert.ok(errorOutput.includes("Missing prompt demos for components:"));
    assert.ok(errorOutput.includes(tempComponentName));
  } finally {
    await rm(tempComponentPath, { force: true });
  }
});
