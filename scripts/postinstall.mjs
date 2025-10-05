import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

if (process.env.npm_config_package_lock_only === "true") {
  console.log("Skipping postinstall: package-lock-only install detected.");
  process.exit(0);
}

if (process.env.SKIP_GALLERY_CHECK === "true") {
  console.log("Skipping postinstall: gallery check explicitly disabled.");
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

const scriptDir = dirname(fileURLToPath(import.meta.url));
const manifestPath = resolve(scriptDir, "../src/components/gallery/generated-manifest.ts");

if (existsSync(manifestPath)) {
  const manifestContents = readFileSync(manifestPath, "utf8").trim();
  if (manifestContents.startsWith("{")) {
    const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
    const { status } = spawnSync(pnpmCommand, ["run", "build-gallery-usage"], {
      stdio: "inherit",
    });

    if (status !== 0) {
      process.exit(status ?? 1);
    }
  }
}

const scriptPath = resolve(scriptDir, "regen-if-needed.ts");
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
