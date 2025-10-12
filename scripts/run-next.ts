import "./check-node-version.js";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
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

const require = createRequire(import.meta.url);
const webpackModule = require("next/dist/compiled/webpack/webpack");

if (typeof webpackModule.init === "function") {
  webpackModule.init();
}

if (
  typeof webpackModule.WebpackError !== "function" &&
  typeof webpackModule.webpack?.WebpackError === "function"
) {
  webpackModule.WebpackError = webpackModule.webpack.WebpackError;
}

if (!fs.existsSync(nextBinary)) {
  console.error(
    "Next.js binary not found. Run `pnpm install` to install project dependencies before starting Next.js.",
  );
  process.exit(1);
}

const normalizeBoolean = (value?: string) => {
  if (typeof value !== "string") {
    return false;
  }

  switch (value.trim().toLowerCase()) {
    case "1":
    case "true":
    case "yes":
    case "on":
      return true;
    default:
      return false;
  }
};

const [command = "dev", ...args] = process.argv.slice(2);

const profilerEnabled = normalizeBoolean(process.env.REACT_PROFILER);
const safeModeEnabled = normalizeBoolean(process.env.SAFE_MODE);
const preferTurboDev = normalizeBoolean(process.env.PREFER_TURBO_DEV);

if (profilerEnabled && safeModeEnabled) {
  console.error(
    "React profiling is disabled while SAFE_MODE is active. Disable SAFE_MODE locally before running the profiler to avoid leaking profiling builds into production.",
  );
  process.exit(1);
}

const forwardedArgs = [...args];

if (profilerEnabled) {
  const hasProfilingFlag = forwardedArgs.includes("--profiling");
  const hasTurboToggle = forwardedArgs.some((arg) =>
    ["--turbo", "--no-turbo"].includes(arg),
  );

  if (!hasProfilingFlag) {
    forwardedArgs.push("--profiling");
  }

  if (!hasTurboToggle && command === "dev") {
    forwardedArgs.push("--turbo");
  }
}

if (
  command === "dev" &&
  preferTurboDev &&
  !forwardedArgs.some((arg) => ["--turbo", "--no-turbo"].includes(arg))
) {
  forwardedArgs.push("--turbo");
}

const portOverride = process.env.PORT?.trim();
const hasPortFlag = forwardedArgs.some((arg) =>
  ["-p", "--port"].includes(arg),
);

if (
  portOverride &&
  !hasPortFlag &&
  (command === "dev" || command === "start")
) {
  forwardedArgs.push("-p", portOverride);
}

const patchModulePath = path.join(rootDir, "scripts", "patch-next-webpack-error.cjs");
const nodeOptions = [process.env.NODE_OPTIONS, `--require ${patchModulePath}`]
  .filter(Boolean)
  .join(" ");

const child = spawn(nextBinary, [command, ...forwardedArgs], {
  cwd: rootDir,
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_OPTIONS: nodeOptions,
    NEXT_DISABLE_REACT_REFRESH: "1",
    DISABLE_FAST_REFRESH: "true",
  },
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
