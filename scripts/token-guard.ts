import "./check-node-version.js";
import { execFile, spawn } from "node:child_process";
import process from "node:process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

async function runCommand(command: string, args: readonly string[]): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, [...args], {
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`${command} exited with signal ${signal}`));
        return;
      }

      if (code && code !== 0) {
        reject(new Error(`${command} exited with code ${code}`));
        return;
      }

      resolve();
    });
  });
}

async function collectTokenDiff(): Promise<string> {
  const { stdout } = await execFileAsync(
    "git",
    ["status", "--porcelain", "--", "docs/tokens.md", "tokens"],
    { encoding: "utf8" },
  );
  return stdout.trim();
}

async function main(): Promise<void> {
  await runCommand("npm", ["run", "--silent", "generate-tokens"]);

  const diff = await collectTokenDiff();
  if (diff.length > 0) {
    console.error("Design tokens are out of date. Run `npm run generate-tokens` and commit the results.");
    console.error(diff);
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
