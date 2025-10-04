import { spawnSync } from "node:child_process";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "..", "..");
const scriptPath = path.join(repoRoot, "scripts", "build-gallery-usage.ts");
const registerLoadersPath = path.join(
  repoRoot,
  "scripts",
  "register-loaders.mjs",
);

const nodeArgs = [
  "--import",
  "tsx",
  "--import",
  registerLoadersPath,
  scriptPath,
];

describe("build-gallery-usage safe mode fallback", () => {
  it("completes when SAFE_MODE variables are unset", () => {
    const env = { ...process.env };
    delete env.NEXT_PUBLIC_SAFE_MODE;
    delete env.SAFE_MODE;

    const result = spawnSync(process.execPath, nodeArgs, {
      cwd: repoRoot,
      env,
      encoding: "utf8",
      stdio: "pipe",
    });

    if (result.error) {
      throw result.error;
    }

    expect(result.status).toBe(0);
  });
});
