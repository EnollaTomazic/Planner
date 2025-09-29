import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

if (process.env.npm_config_package_lock_only === "true") {
  console.log("Skipping postinstall: package-lock-only install detected.");
  process.exit(0);
}

const require = createRequire(import.meta.url);
let tsxModulePath;
try {
  tsxModulePath = require.resolve("tsx");
} catch (error) {
  console.log("Skipping postinstall: tsx is not available yet.");
  process.exit(0);
}

const scriptPath = resolve(dirname(fileURLToPath(import.meta.url)), "regen-if-needed.ts");
const child = spawn(process.execPath, ["--import", tsxModulePath, scriptPath], {
  stdio: "inherit",
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
