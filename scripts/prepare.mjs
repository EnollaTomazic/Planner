import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

if (process.env.npm_config_package_lock_only === "true") {
  console.log("Skipping prepare: package-lock-only install detected.");
  process.exit(0);
}

const scriptDir = dirname(fileURLToPath(import.meta.url));
const huskyBin = resolve(scriptDir, "../node_modules/husky/bin.js");

if (!existsSync(huskyBin)) {
  console.log("Skipping prepare: husky is not available yet.");
  process.exit(0);
}

const child = spawn(process.execPath, [huskyBin, "install"], {
  stdio: "inherit",
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
