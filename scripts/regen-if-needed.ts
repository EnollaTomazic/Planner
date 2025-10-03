import "./check-node-version.js";
import { execSync } from "node:child_process";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import fg from "fast-glob";
import { MultiBar, Presets } from "cli-progress";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const cacheDir = path.join(__dirname, ".cache");

const uiDir = path.join(rootDir, "src/components/ui");
const featureDirs = [
  path.join(rootDir, "src/components/planner"),
  path.join(rootDir, "src/components/prompts"),
];

const uiManifestFile = path.join(cacheDir, "generate-ui-index.json");
const featureManifestFile = path.join(cacheDir, "generate-feature-index.json");
const usageManifestFile = path.join(cacheDir, "build-gallery-usage.json");
const themesManifestFile = path.join(cacheDir, "generate-themes.json");
const tokensManifestFile = path.join(cacheDir, "generate-tokens.json");
const galleryManifestFile = path.join(
  rootDir,
  "src/components/gallery/generated-manifest.ts",
);

const themeInputFiles = [
  path.join(__dirname, "generate-themes.ts"),
  path.join(__dirname, "themes.ts"),
  path.join(__dirname, "themes-static.css"),
  path.join(rootDir, "src/app/themes.css"),
];

const tokenInputFiles = Array.from(
  new Set([
    ...themeInputFiles,
    path.join(__dirname, "generate-tokens.ts"),
    path.join(rootDir, "src/lib/tokens.ts"),
    path.join(rootDir, "src/app/globals.css"),
  ]),
);

type ManifestEntry = { mtimeMs: number };
type Manifest = Record<string, ManifestEntry>;

async function loadManifest(file: string): Promise<Manifest> {
  try {
    const data = await fs.readFile(file, "utf8");
    return JSON.parse(data) as Manifest;
  } catch {
    return {};
  }
}

async function hasChanges(
  manifest: Manifest,
  files: string[],
  relFn: (file: string) => string,
): Promise<boolean> {
  const remaining = new Set(Object.keys(manifest));
  for (const file of files) {
    const rel = relFn(file);
    remaining.delete(rel);
    const stat = await fs.stat(file).catch(() => null);
    if (!stat) {
      return true;
    }
    const entry = manifest[rel];
    if (!entry || entry.mtimeMs !== stat.mtimeMs) {
      return true;
    }
  }
  return remaining.size > 0;
}

async function updateManifest(
  manifestFile: string,
  files: string[],
  relFn: (file: string) => string,
): Promise<void> {
  const manifest: Manifest = {};
  for (const file of files) {
    const stat = await fs.stat(file).catch(() => null);
    if (!stat) {
      // Skip files that are missing; they will trigger regeneration next run.
      continue;
    }
    manifest[relFn(file)] = { mtimeMs: stat.mtimeMs };
  }
  await fs.mkdir(cacheDir, { recursive: true });
  await fs.writeFile(manifestFile, JSON.stringify(manifest, null, 2));
}

async function uiChanged(): Promise<boolean> {
  const files = await fg(["**/*.{ts,tsx}", "!**/index.ts", "!**/index.tsx"], {
    cwd: uiDir,
    absolute: true,
  });
  const manifest = await loadManifest(uiManifestFile);
  return hasChanges(manifest, files, (f) =>
    path.relative(uiDir, f).replace(/\\/g, "/"),
  );
}

async function featureChanged(): Promise<boolean> {
  const patterns = ["**/*.{ts,tsx}", "!**/index.ts", "!**/index.tsx"];
  const files = (
    await Promise.all(
      featureDirs.map((dir) => fg(patterns, { cwd: dir, absolute: true })),
    )
  ).flat();
  const manifest = await loadManifest(featureManifestFile);
  return hasChanges(manifest, files, (f) =>
    path.relative(rootDir, f).replace(/\\/g, "/"),
  );
}

async function usageChanged(): Promise<boolean> {
  const patterns = [
    "src/app/**/*.{ts,tsx}",
    "src/components/**/*.gallery.{ts,tsx}",
  ];
  const files = await fg(patterns, { cwd: rootDir, absolute: true });
  const manifest = await loadManifest(usageManifestFile);
  return hasChanges(
    manifest,
    Array.from(new Set(files)),
    (f) => path.relative(rootDir, f).replace(/\\/g, "/"),
  );
}

async function themesChanged(): Promise<boolean> {
  const manifest = await loadManifest(themesManifestFile);
  return hasChanges(
    manifest,
    themeInputFiles,
    (f) => path.relative(rootDir, f).replace(/\\/g, "/"),
  );
}

async function tokensChanged(): Promise<boolean> {
  const manifest = await loadManifest(tokensManifestFile);
  return hasChanges(
    manifest,
    tokenInputFiles,
    (f) => path.relative(rootDir, f).replace(/\\/g, "/"),
  );
}

function run(cmd: string): void {
  execSync(cmd, { stdio: "inherit" });
}

function getGitStatusLines(cwd: string): string[] {
  const output = execSync("git status --porcelain", {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  }).trim();

  if (!output) {
    return [];
  }

  return output.split("\n").map((line) => line.trimEnd());
}

function assertCleanGitTree(cwd: string, message: string): void {
  const changes = getGitStatusLines(cwd);
  if (changes.length > 0) {
    throw new Error(`${message}\n\n${changes.join("\n")}`);
  }
}

type GeneratorValidation = {
  name: string;
  command: string;
};

export const generatorValidations: GeneratorValidation[] = [
  {
    name: "UI component index",
    command: "pnpm run regen-ui",
  },
  {
    name: "Feature component index",
    command: "pnpm run regen-feature",
  },
  {
    name: "Gallery manifest",
    command: "pnpm run build-gallery-usage",
  },
  {
    name: "Theme CSS",
    command: "pnpm run generate-themes",
  },
  {
    name: "Design tokens",
    command: "pnpm run generate-tokens",
  },
];

type ValidateGeneratorOptions = {
  cwd?: string;
};

export function validateGenerators(
  generators: GeneratorValidation[],
  options: ValidateGeneratorOptions = {},
): void {
  const cwd = options.cwd ?? rootDir;

  for (const generator of generators) {
    assertCleanGitTree(
      cwd,
      `${generator.name} validation requires a clean working tree. Stash or commit your changes before rerunning.`,
    );

    try {
      execSync(generator.command, { cwd, stdio: "inherit" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      throw new Error(
        `${generator.name} validation failed while executing \`${generator.command}\`:\n${message}`,
      );
    }

    assertCleanGitTree(
      cwd,
      `${generator.name} outputs are stale. Run \`${generator.command}\` and commit the generated files.`,
    );
  }
}

const isCiEnvironment = (() => {
  const value = process.env.CI;
  if (!value) {
    return false;
  }
  return value !== "false" && value !== "0";
})();

async function validateGalleryManifest(): Promise<void> {
  let contents: string;
  try {
    contents = await fs.readFile(galleryManifestFile, "utf8");
  } catch {
    throw new Error(
      "Missing gallery manifest. Run `pnpm run build-gallery` to regenerate src/components/gallery/generated-manifest.ts.",
    );
  }

  const trimmed = contents.trimStart();
  if (trimmed.startsWith("{")) {
    throw new Error(
      "Gallery manifest appears to contain raw JSON. Run `pnpm run build-gallery` to regenerate src/components/gallery/generated-manifest.ts.",
    );
  }

  const requiredExports = [
    "export const galleryPayload",
    "export const galleryPreviewRoutes",
    "export const galleryPreviewModules",
  ];
  const missingExports = requiredExports.filter(
    (signature) => !contents.includes(signature),
  );

  if (missingExports.length > 0) {
    const exportNames = missingExports
      .map((signature) => signature.replace("export const ", ""))
      .join(", ");
    throw new Error(
      `Gallery manifest is missing required exports: ${exportNames}. Run \`pnpm run build-gallery\` to regenerate src/components/gallery/generated-manifest.ts.`,
    );
  }
}

async function main() {
  if (isCiEnvironment) {
    await validateGalleryManifest();
    validateGenerators(generatorValidations);
    console.log("Skipping regeneration tasks");
    return;
  }

  const [
    needsUi,
    needsFeature,
    initialNeedsUsage,
    needsThemes,
    needsTokens,
  ] = await Promise.all([
    uiChanged(),
    featureChanged(),
    usageChanged(),
    themesChanged(),
    tokensChanged(),
  ]);

  let needsUsage = initialNeedsUsage;

  try {
    await validateGalleryManifest();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(
      [
        "Gallery manifest validation failed; running `pnpm run build-gallery-usage` to regenerate.",
        message,
      ].join("\n"),
    );
    needsUsage = true;
  }

  if (!needsUi && !needsFeature && !needsUsage && !needsThemes && !needsTokens) {
    console.log("Skipping regeneration tasks");
    return;
  }

  const total =
    (needsUi ? 1 : 0) +
    (needsFeature ? 1 : 0) +
    (needsUsage ? 1 : 0) +
    (needsThemes ? 1 : 0) +
    (needsTokens ? 1 : 0);
  const bars = new MultiBar(
    { clearOnComplete: false, hideCursor: true },
    Presets.shades_grey,
  );
  const taskBar = bars.create(total, 0);

  if (needsUi) {
    run("pnpm run regen-ui");
    taskBar.increment();
  }
  if (needsFeature) {
    run("pnpm run regen-feature");
    taskBar.increment();
  }
  if (needsUsage) {
    run("pnpm run build-gallery-usage");
    taskBar.increment();
  }
  if (needsThemes) {
    run("pnpm run generate-themes");
    await updateManifest(
      themesManifestFile,
      themeInputFiles,
      (f) => path.relative(rootDir, f).replace(/\\/g, "/"),
    );
    taskBar.increment();
  }
  if (needsTokens) {
    run("pnpm run generate-tokens");
    await updateManifest(
      tokensManifestFile,
      tokenInputFiles,
      (f) => path.relative(rootDir, f).replace(/\\/g, "/"),
    );
    taskBar.increment();
  }

  bars.stop();

  if (needsUsage) {
    await validateGalleryManifest();
  }
}

const entryPoint = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : undefined;

if (entryPoint === import.meta.url) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
