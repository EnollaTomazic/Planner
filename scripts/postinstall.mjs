import { spawnSync } from "node:child_process";
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

const isCiEnvironment = (() => {
  const value = process.env.CI;
  if (!value) {
    return false;
  }

  const normalized = value.toLowerCase();
  return normalized !== "false" && normalized !== "0";
})();

const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
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
const scriptPath = resolve(scriptDir, "regen-if-needed.ts");

const runGalleryManifestGeneration = () => {
  const result = spawnSync(pnpmCommand, ["run", "build-gallery-usage"], {
    stdio: "inherit",
  });

  if (result.status === 0) {
    return 0;
  }

  const exitCode = result.status ?? 1;
  const reason = result.error?.message;
  if (reason) {
    console.warn(`Failed to regenerate gallery manifest: ${reason}`);
  } else {
    console.warn(
      `Failed to regenerate gallery manifest: command exited with code ${exitCode}.`,
    );
  }

  return exitCode;
};

const runRegenIfNeeded = () => {
  const result = spawnSync(process.execPath, ["--import", tsxModulePath, scriptPath], {
    stdio: "inherit",
  });

  if (result.status === 0) {
    return 0;
  }

  if (result.error) {
    console.error(result.error);
  }

  return result.status ?? 1;
};

const shouldSkipForCi = (exitCode, attempted) => {
  if (!isCiEnvironment) {
    return false;
  }

  if (exitCode === 0) {
    return false;
  }

  if (!attempted) {
    return false;
  }

  console.warn(
    "Gallery manifest regeneration failed during postinstall; continuing because CI will run validation separately.",
  );
  return true;
};

let attemptedGalleryRegeneration = false;
let galleryRegenerationExitCode = 0;

if (existsSync(manifestPath)) {
  const manifestContents = readFileSync(manifestPath, "utf8").trimStart();
  if (manifestContents.startsWith("{")) {
    attemptedGalleryRegeneration = true;
    galleryRegenerationExitCode = runGalleryManifestGeneration();

    if (
      shouldSkipForCi(
        galleryRegenerationExitCode,
        attemptedGalleryRegeneration && galleryRegenerationExitCode !== 0,
      )
    ) {
      process.exit(0);
    }

    if (galleryRegenerationExitCode !== 0) {
      process.exit(galleryRegenerationExitCode);
    }
  }
}

const runRegenWithFallback = () => {
  let exitCode = runRegenIfNeeded();

  if (exitCode === 0) {
    return 0;
  }

  if (!attemptedGalleryRegeneration) {
    attemptedGalleryRegeneration = true;
    galleryRegenerationExitCode = runGalleryManifestGeneration();

    if (
      shouldSkipForCi(
        galleryRegenerationExitCode,
        attemptedGalleryRegeneration && galleryRegenerationExitCode !== 0,
      )
    ) {
      return 0;
    }

    if (galleryRegenerationExitCode === 0) {
      exitCode = runRegenIfNeeded();
      return exitCode;
    }

    return galleryRegenerationExitCode;
  }

  return exitCode;
};

const finalExitCode = runRegenWithFallback();
if (
  shouldSkipForCi(
    finalExitCode,
    attemptedGalleryRegeneration && galleryRegenerationExitCode !== 0,
  )
) {
  process.exit(0);
}

process.exit(finalExitCode);
