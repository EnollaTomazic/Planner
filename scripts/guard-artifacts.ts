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
    resolution: "Remove the \"node-compile-cache\" directory created by tsx (e.g. `rm -rf node-compile-cache`).",
  },
  {
    glob: ["tsx-*"],
    label: "tsx scratch directory",
    resolution: "Delete stray \"tsx-*\" directories produced by tsx (e.g. `rm -rf tsx-*`).",
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

async function runGuard(): Promise<void> {
  const offenders = await detectForbiddenArtifacts(repoRoot);
  if (offenders.length === 0) {
    return;
  }

  console.error("Detected forbidden runtime artifacts in the working tree:\n");
  for (const offender of offenders) {
    console.error(` • ${offender.path} (${offender.label})`);
    console.error(`   → ${offender.resolution}`);
  }
  console.error("\nRemove these directories before committing.");
  process.exit(1);
}

runGuard().catch((error) => {
  console.error(error);
  process.exit(1);
});
