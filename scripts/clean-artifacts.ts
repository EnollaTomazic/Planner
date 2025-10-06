import "./check-node-version.js";
import { detectForbiddenArtifacts, FORBIDDEN_PATTERNS } from "./guard-artifacts";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

async function removeArtifacts(): Promise<void> {
  const offenders = await detectForbiddenArtifacts(repoRoot, FORBIDDEN_PATTERNS);

  if (offenders.length === 0) {
    console.log("No forbidden runtime artifacts detected.");
    return;
  }

  console.log("Removing forbidden runtime artifacts:\n");
  for (const offender of offenders) {
    const absolute = path.resolve(repoRoot, offender.path);
    try {
      await fs.rm(absolute, { recursive: true, force: true });
      console.log(` • Removed ${offender.path} (${offender.label})`);
    } catch (error) {
      console.error(`Failed to remove ${offender.path}:`, error);
    }
  }
}

removeArtifacts().catch((error) => {
  console.error(error);
  process.exit(1);
});
