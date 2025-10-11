import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve, relative } from "node:path";

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
const repoRoot = resolve(scriptDir, "..");
const manifestPath = resolve(
  repoRoot,
  "src/components/gallery/generated-manifest.g.ts",
);
const manifestPayloadPath = resolve(
  repoRoot,
  "src/components/gallery/generated-manifest.ts",
);
const manifestFiles = [manifestPath, manifestPayloadPath];
const scriptPath = resolve(scriptDir, "regen-if-needed.ts");

const leadingCommentPattern = /^(?:\uFEFF)?\s*(?:\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*)*/u;

const appearsToBeRawJson = (contents) => {
  const sanitized = contents.replace(leadingCommentPattern, "").trimStart();
  if (!sanitized) {
    return false;
  }
  return sanitized.startsWith("{") || sanitized.startsWith("[");
};

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

const describeManifestFile = (filePath) =>
  relative(repoRoot, filePath).replace(/\\/g, "/");

const findRawJsonManifestFile = () => {
  for (const filePath of manifestFiles) {
    if (!existsSync(filePath)) {
      continue;
    }
    const contents = readFileSync(filePath, "utf8");
    if (appearsToBeRawJson(contents)) {
      return filePath;
    }
  }
  return null;
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

if (isCiEnvironment) {
  const rawJsonFile = findRawJsonManifestFile();
  if (rawJsonFile) {
    console.log(
      `[postinstall][CI] Raw JSON detected in ${describeManifestFile(rawJsonFile)} → running build-gallery-usage…`,
    );
    runGalleryManifestGeneration();
  }

  console.log("[postinstall][CI] Skipping strict validation on CI (validated later in workflow).");
  process.exit(0);
}

let attemptedGalleryRegeneration = false;
let galleryRegenerationExitCode = 0;

const rawJsonFile = findRawJsonManifestFile();
if (rawJsonFile) {
  attemptedGalleryRegeneration = true;
  console.log(
    `[postinstall] Raw JSON detected in ${describeManifestFile(rawJsonFile)} → running build-gallery-usage…`,
  );
  galleryRegenerationExitCode = runGalleryManifestGeneration();

  if (galleryRegenerationExitCode !== 0) {
    process.exit(galleryRegenerationExitCode);
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

    if (galleryRegenerationExitCode === 0) {
      exitCode = runRegenIfNeeded();
      return exitCode;
    }

    return galleryRegenerationExitCode;
  }

  return exitCode;
};

const finalExitCode = runRegenWithFallback();
process.exit(finalExitCode);
