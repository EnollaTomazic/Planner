import { spawnSync } from "node:child_process";
import fs from "node:fs";
import process from "node:process";

import {
  detectRepositorySlug,
  isUserOrOrgGitHubPagesRepository,
  parseGitHubRepository,
} from "./deploy-gh-pages";

function formatValue(value: string): string {
  return value.length > 0 ? value : "<empty>";
}

function main(): void {
  const nvmrcPath = new URL("../.nvmrc", import.meta.url);
  const nvmrcVersion = fs.readFileSync(nvmrcPath, "utf8").trim();
  console.log(`[deploy-env] .nvmrc Node version: ${nvmrcVersion}`);

  const { slug, ownerSlug: fallbackOwnerSlug } = detectRepositorySlug(spawnSync, {
    preferBasePathEnv: false,
  });
  const repositoryParts = parseGitHubRepository(process.env.GITHUB_REPOSITORY);
  const isUserOrOrgGitHubPage = isUserOrOrgGitHubPagesRepository({
    repositoryOwnerSlug: repositoryParts.owner ?? fallbackOwnerSlug,
    repositoryNameSlug: repositoryParts.name,
    fallbackSlug: slug,
  });

  const expectedBasePath = slug.length > 0 && !isUserOrOrgGitHubPage ? slug : "";
  const expectedNextPublicBasePath = expectedBasePath ? `/${expectedBasePath}` : "";

  const actualBasePath = (process.env.BASE_PATH ?? "").trim();
  const actualNextPublicBasePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").trim();

  console.log(`[deploy-env] Repository slug: ${formatValue(slug)}`);
  console.log(`[deploy-env] Expected BASE_PATH: ${formatValue(expectedBasePath)}`);
  console.log(`[deploy-env] Actual BASE_PATH:   ${formatValue(actualBasePath)}`);
  console.log(
    `[deploy-env] Expected NEXT_PUBLIC_BASE_PATH: ${formatValue(expectedNextPublicBasePath)}`,
  );
  console.log(
    `[deploy-env] Actual NEXT_PUBLIC_BASE_PATH:   ${formatValue(actualNextPublicBasePath)}`,
  );

  const mismatches: string[] = [];
  if (actualBasePath !== expectedBasePath) {
    mismatches.push(
      `BASE_PATH should be "${expectedBasePath}" but was "${actualBasePath}"`,
    );
  }
  if (actualNextPublicBasePath !== expectedNextPublicBasePath) {
    mismatches.push(
      `NEXT_PUBLIC_BASE_PATH should be "${expectedNextPublicBasePath}" but was "${actualNextPublicBasePath}"`,
    );
  }

  if (mismatches.length > 0) {
    mismatches.push(
      "Update BASE_PATH and NEXT_PUBLIC_BASE_PATH to match the repository slug before deploying.",
    );
    throw new Error(`Deploy environment mismatch:\n - ${mismatches.join("\n - ")}`);
  }
}

try {
  main();
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }
  process.exit(1);
}
