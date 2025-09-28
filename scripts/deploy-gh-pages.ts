import "./check-node-version.js";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";

function shouldPublishSite(env: NodeJS.ProcessEnv): boolean {
  const mode = env.DEPLOY_ARTIFACT_ONLY?.trim().toLowerCase();
  if (!mode) {
    return true;
  }

  return mode !== "true" && mode !== "1";
}

function assertOriginRemote(env: NodeJS.ProcessEnv, publish: boolean): void {
  if (!publish) {
    return;
  }

  const repository = env.GITHUB_REPOSITORY?.trim();
  const token = env.GITHUB_TOKEN?.trim();

  const remoteResult = spawnSync("git", ["remote", "get-url", "origin"], {
    stdio: ["ignore", "ignore", "ignore"],
  });

  if (remoteResult.status !== 0 && !repository && !token) {
    throw new Error(
      "No git remote named \"origin\" is configured. Add an origin remote or set GITHUB_REPOSITORY and GITHUB_TOKEN before running the deploy script.",
    );
  }
}

function isCiEnvironment(env: NodeJS.ProcessEnv): boolean {
  const value = env.CI;
  if (!value) {
    return false;
  }

  const normalized = value.toLowerCase();
  return normalized !== "false" && normalized !== "0";
}

function resolvePublishBranch(env: NodeJS.ProcessEnv): string {
  const fromEnv =
    sanitizeSlug(env.GH_PAGES_BRANCH) ?? sanitizeSlug(env.GITHUB_PAGES_BRANCH);

  return fromEnv ?? "gh-pages";
}

function createGhPagesArgs(env: NodeJS.ProcessEnv): string[] {
  const branch = resolvePublishBranch(env);
  const args = ["gh-pages", "-d", "out", "-b", branch, "--nojekyll"];
  const token = env.GITHUB_TOKEN?.trim();
  const repository = env.GITHUB_REPOSITORY?.trim();

  if (!token || !repository) {
    return args;
  }

  if (isCiEnvironment(env)) {
    const repoUrl = `https://x-access-token:${token}@github.com/${repository}.git`;
    args.push("--repo", repoUrl);
  }

  return args;
}

function sanitizeSlug(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }
  const cleaned = trimmed.replace(/^\/+|\/+$/gu, "");
  return cleaned.length > 0 ? cleaned : undefined;
}

function parseRemoteSlug(remoteUrl: string): string | undefined {
  const normalized = remoteUrl.replace(/\.git$/u, "");
  const match = normalized.match(/[:/]([^/]+)\/([^/]+)$/u);
  const [, , slug] = match ?? [];
  return sanitizeSlug(slug);
}

function detectRepositorySlug(): string {
  const basePathEnv = process.env.BASE_PATH;
  if (basePathEnv !== undefined) {
    const fromEnv = sanitizeSlug(basePathEnv);
    return fromEnv ?? "";
  }

  const repoSlug = sanitizeSlug(process.env.GITHUB_REPOSITORY?.split("/").pop());
  if (repoSlug) {
    return repoSlug;
  }

  const remoteResult = spawnSync("git", ["config", "--get", "remote.origin.url"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });

  if (remoteResult.status === 0 && typeof remoteResult.stdout === "string") {
    const remote = remoteResult.stdout.trim();
    const remoteSlug = parseRemoteSlug(remote);
    if (remoteSlug) {
      return remoteSlug;
    }
  }

  const folderSlug = sanitizeSlug(path.basename(process.cwd()));
  if (folderSlug) {
    return folderSlug;
  }

  throw new Error(
    "Unable to determine repository slug. Set BASE_PATH to your repository name before running this script.",
  );
}

function runCommand(command: string, args: readonly string[], env: NodeJS.ProcessEnv): void {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env,
  });

  if (result.status !== 0) {
    const reason =
      result.error?.message ??
      `Command \"${command} ${args.join(" ")}\" exited with code ${result.status ?? "unknown"}`;
    throw new Error(reason);
  }
}

function createTemporarySlugDirectoryPath(outDir: string, slug: string): string {
  let attempt = 0;
  while (true) {
    const suffix = attempt === 0 ? "" : `-${attempt}`;
    const candidate = path.join(outDir, `${slug}.tmp${suffix}`);
    if (!fs.existsSync(candidate)) {
      return candidate;
    }
    attempt += 1;
  }
}

export function flattenBasePathDirectory(outDir: string, slug: string): void {
  if (!slug) {
    return;
  }

  const nestedDir = path.join(outDir, slug);
  if (!fs.existsSync(nestedDir) || !fs.statSync(nestedDir).isDirectory()) {
    return;
  }

  const temporaryDir = createTemporarySlugDirectoryPath(outDir, slug);
  fs.renameSync(nestedDir, temporaryDir);

  for (const entry of fs.readdirSync(temporaryDir)) {
    const temporarySourcePath = path.join(temporaryDir, entry);
    const originalSourcePath = path.join(nestedDir, entry);
    const targetPath = path.join(outDir, entry);
    if (fs.existsSync(targetPath)) {
      throw new Error(
        `Cannot move \"${originalSourcePath}\" to \"${targetPath}\" because the destination already exists.`,
      );
    }
    fs.renameSync(temporarySourcePath, targetPath);
  }

  fs.rmSync(temporaryDir, { recursive: true, force: true });
}

function ensureNoJekyll(outDir: string): void {
  const markerPath = path.join(outDir, ".nojekyll");
  if (fs.existsSync(markerPath)) {
    return;
  }

  fs.writeFileSync(markerPath, "");
}

function main(): void {
  const publish = shouldPublishSite(process.env);
  assertOriginRemote(process.env, publish);
  const slug = detectRepositorySlug();
  const repositorySlug = sanitizeSlug(process.env.GITHUB_REPOSITORY?.split("/").pop());
  const isUserOrOrgGitHubPage = (repositorySlug ?? slug)?.endsWith(".github.io") ?? false;
  const shouldUseBasePath = slug.length > 0 && !isUserOrOrgGitHubPage;
  const basePath = shouldUseBasePath ? `/${slug}` : "";
  console.log(`Deploying with base path ${basePath || "/"}`);

  const buildEnv: NodeJS.ProcessEnv = {
    ...process.env,
    GITHUB_PAGES: "true",
    BASE_PATH: shouldUseBasePath ? slug : "",
  };

  runCommand(npmCommand, ["run", "build"], buildEnv);

  const outDir = path.resolve("out");
  if (shouldUseBasePath) {
    flattenBasePathDirectory(outDir, slug);
  }
  ensureNoJekyll(outDir);

  if (!publish) {
    console.log("Skipping gh-pages publish step");
    return;
  }

  const ghPagesArgs = createGhPagesArgs(process.env);
  runCommand(npxCommand, ghPagesArgs, process.env);
}

if (process.env.VITEST !== "true") {
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
}
