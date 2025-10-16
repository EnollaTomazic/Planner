import "./check-node-version.js";
import fg from "fast-glob";
import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

type ForbiddenPattern = {
  readonly glob: readonly string[];
  readonly label: string;
  readonly resolution: string;
};

type ForbiddenMatch = {
  readonly path: string;
  readonly label: string;
  readonly resolution: string;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const IGNORED_DIRECTORIES = ["node_modules/**", ".git/**", ".next/**", "out/**", "dist/**"] as const;

export const FORBIDDEN_PATTERNS: readonly ForbiddenPattern[] = [
  {
    glob: ["**/node-compile-cache"],
    label: "node-compile-cache",
    resolution:
      "Remove the \"node-compile-cache\" directory created by tsx (e.g. `pnpm run clean:artifacts` or `rm -rf node-compile-cache`).",
  },
  {
    glob: ["tsx-*"],
    label: "tsx scratch directory",
    resolution:
      "Delete stray \"tsx-*\" directories produced by tsx (e.g. `pnpm run clean:artifacts` or `rm -rf tsx-*`).",
  },
];

export async function detectForbiddenArtifacts(
  rootDir: string,
  patterns: readonly ForbiddenPattern[] = FORBIDDEN_PATTERNS,
): Promise<ForbiddenMatch[]> {
  const matches: ForbiddenMatch[] = [];

  for (const pattern of patterns) {
    const results = await fg(Array.from(pattern.glob), {
      cwd: rootDir,
      dot: true,
      onlyDirectories: true,
      unique: true,
      suppressErrors: true,
      ignore: [...IGNORED_DIRECTORIES],
    });

    for (const relative of results) {
      const absolute = path.resolve(rootDir, relative);
      try {
        const stats = await fs.stat(absolute);
        if (!stats.isDirectory()) {
          continue;
        }
      } catch {
        continue;
      }

      matches.push({
        path: relative,
        label: pattern.label,
        resolution: pattern.resolution,
      });
    }
  }

  matches.sort((a, b) => a.path.localeCompare(b.path));
  return matches;
}

function envFlag(name: string): boolean {
  const raw = process.env[name];
  if (!raw) {
    return false;
  }
  if (raw === "1") {
    return true;
  }
  return raw.toLowerCase() === "true";
}

async function runGuard(): Promise<void> {
  const isCi = envFlag("CI");
  const enforceGuard = envFlag("GUARD_ARTIFACTS_ENFORCE");
  const treatAsWarning = isCi && !enforceGuard;

  const offenders = await detectForbiddenArtifacts(repoRoot);
  if (offenders.length === 0) {
    return;
  }

  const logger = treatAsWarning ? console.warn : console.error;
  logger("Detected forbidden runtime artifacts in the working tree:\n");
  for (const offender of offenders) {
    logger(` • ${offender.path} (${offender.label})`);
    logger(`   → ${offender.resolution}`);
  }
  if (treatAsWarning) {
    console.warn(
      "\nContinuing despite the detected directories because guard:artifacts runs in warning mode on CI (set GUARD_ARTIFACTS_ENFORCE=1 to fail).",
    );
    return;
  }
  console.error("\nRemove these directories before committing.");
  process.exit(1);
}

const executedPath = process.argv[1] ? path.resolve(process.argv[1]) : undefined;

if (executedPath === __filename) {
  runGuard().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
