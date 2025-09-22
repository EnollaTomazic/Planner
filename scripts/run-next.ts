import "./check-node-version.js";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const nextBinary = path.join(
  rootDir,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "next.cmd" : "next",
);

if (!fs.existsSync(nextBinary)) {
  console.error(
    "Next.js binary not found. Run `npm install` to install project dependencies before starting Next.js.",
  );
  process.exit(1);
}

const [command = "dev", ...args] = process.argv.slice(2);

const child = spawn(nextBinary, [command, ...args], {
  cwd: rootDir,
  stdio: "inherit",
  env: process.env,
});

child.on("error", (error) => {
  console.error("Failed to run Next.js:", error);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
