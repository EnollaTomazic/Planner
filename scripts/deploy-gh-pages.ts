import "./check-node-version.js";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import process from "node:process";

import { GITHUB_PAGES_REDIRECT_STORAGE_KEY } from "../src/lib/github-pages";
import { normalizeBasePath } from "../lib/base-path.js";

const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const PRODUCTION_BASE_PATH_SLUG = "Planner";
const PRODUCTION_NEXT_PUBLIC_BASE_PATH =
  normalizeBasePath(PRODUCTION_BASE_PATH_SLUG);

function shouldPublishSite(env: NodeJS.ProcessEnv): boolean {
  const mode = env.DEPLOY_ARTIFACT_ONLY?.trim().toLowerCase();
  if (!mode) {
    return true;
  }

  return mode !== "true" && mode !== "1";
}

function canPublishWithGit(env: NodeJS.ProcessEnv): boolean {
  const repository = env.GITHUB_REPOSITORY?.trim();
  const token = env.GITHUB_TOKEN?.trim();

  const remoteResult = spawnSync("git", ["remote", "get-url", "origin"], {
    stdio: ["ignore", "ignore", "ignore"],
  });

  if (remoteResult.status === 0) {
    return true;
  }

  return Boolean(repository && token);
}

function isCiEnvironment(env: NodeJS.ProcessEnv): boolean {
  const value = env.CI;
  if (!value) {
    return false;
  }

  const normalized = value.toLowerCase();
  return normalized !== "false" && normalized !== "0";
}

function isProductionEnvironment(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  return value.trim().toLowerCase() === "production";
}

export function applyProductionBasePathDefaults(env: NodeJS.ProcessEnv): void {
  if (!isProductionEnvironment(env.NODE_ENV)) {
    return;
  }

  const basePathProvided = env.BASE_PATH !== undefined;
  const sanitizedBasePath = sanitizeSlug(env.BASE_PATH);
  const basePathSlug = sanitizedBasePath ?? PRODUCTION_BASE_PATH_SLUG;
  const normalizedBasePath =
    sanitizedBasePath !== undefined
      ? normalizeBasePath(sanitizedBasePath)
      : PRODUCTION_NEXT_PUBLIC_BASE_PATH;

  if (!basePathProvided) {
    env.BASE_PATH = basePathSlug;
  }

  const nextPublicBasePathProvided = env.NEXT_PUBLIC_BASE_PATH !== undefined;
  if (!nextPublicBasePathProvided) {
    env.NEXT_PUBLIC_BASE_PATH = normalizedBasePath;
  }
}

function detectDefaultBranch(): string | undefined {
  const commands: Array<readonly [string, readonly string[]]> = [
    ["git", ["symbolic-ref", "--short", "refs/remotes/origin/HEAD"]],
    ["git", ["rev-parse", "--abbrev-ref", "origin/HEAD"]],
  ];

  for (const [command, args] of commands) {
    const result = spawnSync(command, args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });

    if (result.status === 0 && typeof result.stdout === "string") {
      const candidate = result.stdout.trim().replace(/^origin\//u, "");
      const slug = sanitizeSlug(candidate);
      if (slug) {
        return slug;
      }
    }
  }

  const remoteShow = spawnSync("git", ["remote", "show", "origin"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });

  if (remoteShow.status === 0 && typeof remoteShow.stdout === "string") {
    const match = remoteShow.stdout.match(/HEAD branch:\s*(?<branch>[^\s]+)/u);
    const branch = match?.groups?.branch;
    const slug = sanitizeSlug(branch);
    if (slug) {
      return slug;
    }
  }

  return undefined;
}

type PublishBranchOptions = {
  readonly fallbackBranch?: string;
};

type DetectDefaultBranch = () => string | undefined;

export function resolvePublishBranch(
  env: NodeJS.ProcessEnv,
  options: PublishBranchOptions,
  detect: DetectDefaultBranch = detectDefaultBranch,
): string {
  const fromEnv =
    sanitizeSlug(env.GH_PAGES_BRANCH) ?? sanitizeSlug(env.GITHUB_PAGES_BRANCH);
  if (fromEnv) {
    return fromEnv;
  }

  const fromGit = detect();
  const fallbackBranch = sanitizeSlug(options.fallbackBranch);

  if (fromGit) {
    if (fallbackBranch && fallbackBranch !== fromGit) {
      throw new Error(
        `Detected default branch "${fromGit}" does not match the configured GitHub Pages branch "${fallbackBranch}". Set GH_PAGES_BRANCH to "${fromGit}" (or adjust your repository configuration) so GitHub Pages and main publish from the same branch.`,
      );
    }
    return fromGit;
  }

  if (fallbackBranch) {
    return fallbackBranch;
  }

  return fromGit ?? "gh-pages";
}

function createGhPagesArgs(
  env: NodeJS.ProcessEnv,
  options: PublishBranchOptions,
): string[] {
  const branch = resolvePublishBranch(env, options);
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

function normalizeSlugForComparison(value: string | undefined): string | undefined {
  const sanitized = sanitizeSlug(value);
  return sanitized?.toLowerCase();
}

type GitHubRepositoryParts = {
  readonly owner?: string;
  readonly name?: string;
};

type RepositorySlugDetectionResult = {
  readonly slug: string;
  readonly ownerSlug?: string;
};

export function parseGitHubRepository(value: string | undefined): GitHubRepositoryParts {
  const trimmed = value?.trim();
  if (!trimmed) {
    return {};
  }

  const [owner, name] = trimmed.split("/");
  return {
    owner: sanitizeSlug(owner),
    name: sanitizeSlug(name),
  };
}

export function isUserOrOrgGitHubPagesRepository({
  repositoryOwnerSlug,
  repositoryNameSlug,
  fallbackSlug,
}: {
  readonly repositoryOwnerSlug?: string;
  readonly repositoryNameSlug?: string;
  readonly fallbackSlug?: string;
}): boolean {
  if (!repositoryOwnerSlug) {
    return false;
  }

  const normalizedOwnerSlug = normalizeSlugForComparison(repositoryOwnerSlug);
  if (!normalizedOwnerSlug) {
    return false;
  }

  const candidateSlug = normalizeSlugForComparison(
    repositoryNameSlug ?? fallbackSlug,
  );
  if (!candidateSlug) {
    return false;
  }

  const expectedSlug = `${normalizedOwnerSlug}.github.io`;

  return candidateSlug === expectedSlug;
}

function parseRemoteSlug(remoteUrl: string): GitHubRepositoryParts {
  const normalized = remoteUrl.replace(/\.git$/u, "");
  const match = normalized.match(/[:/]([^/]+)\/([^/]+)$/u);
  const [, owner, name] = match ?? [];
  return {
    owner: sanitizeSlug(owner),
    name: sanitizeSlug(name),
  };
}

type RepositorySlugDetectionOptions = {
  readonly preferBasePathEnv?: boolean;
};

export function detectRepositorySlug(
  spawn: typeof spawnSync = spawnSync,
  options: RepositorySlugDetectionOptions = {},
): RepositorySlugDetectionResult {
  const preferBasePathEnv = options.preferBasePathEnv ?? true;

  if (preferBasePathEnv) {
    const basePathEnv = process.env.BASE_PATH;
    if (basePathEnv !== undefined) {
      const fromEnv = sanitizeSlug(basePathEnv);
      const { owner } = parseGitHubRepository(process.env.GITHUB_REPOSITORY);
      return {
        slug: fromEnv ?? "",
        ownerSlug: owner,
      };
    }
  }

  const repositoryParts = parseGitHubRepository(process.env.GITHUB_REPOSITORY);
  if (repositoryParts.name) {
    return {
      slug: repositoryParts.name,
      ownerSlug: repositoryParts.owner,
    };
  }

  let remoteParts: GitHubRepositoryParts = {};
  const remoteResult = spawn("git", ["config", "--get", "remote.origin.url"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });

  if (remoteResult.status === 0 && typeof remoteResult.stdout === "string") {
    const remote = remoteResult.stdout.trim();
    remoteParts = parseRemoteSlug(remote);
    if (remoteParts.name) {
      return {
        slug: remoteParts.name,
        ownerSlug: remoteParts.owner,
      };
    }
  }

  const folderSlug = sanitizeSlug(path.basename(process.cwd()));
  if (folderSlug) {
    return {
      slug: folderSlug,
      ownerSlug: remoteParts.owner ?? repositoryParts.owner,
    };
  }

  throw new Error(
    "Unable to determine repository slug. Set BASE_PATH to your repository name before running this script.",
  );
}

type CommandRunner = (
  command: string,
  args: readonly string[],
  env: NodeJS.ProcessEnv,
) => void;

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

export function buildStaticSite(
  pnpmExecutable: string,
  env: NodeJS.ProcessEnv,
  runner: CommandRunner = runCommand,
): void {
  runner(pnpmExecutable, ["run", "build"], env);
}

const ROOT_PRESERVE_ENTRIES = new Set(["404.html", ".nojekyll", "CNAME"]);

function createRootRedirectHtml(slug: string): string {
  const normalizedSlug = slug.replace(/^\/+|\/+$/gu, "");
  const targetPath = normalizedSlug.length > 0 ? `./${normalizedSlug}/` : "./";

  return [
    "<!DOCTYPE html>",
    '<html lang="en">',
    "  <head>",
    "    <meta charSet=\"utf-8\" />",
    "    <meta http-equiv=\"refresh\" content=\"0; url='" + targetPath + "'\" />",
    "    <link rel=\"canonical\" href=\"" + targetPath + "\" />",
    "    <title>Redirecting…</title>",
    "  </head>",
    "  <body>",
    "    <p>Redirecting to <a href=\"" + targetPath + "\">" + targetPath + "</a>…</p>",
    "  </body>",
    "</html>",
  ].join("\n");
}

export function flattenBasePathDirectory(outDir: string, slug: string): void {
  const normalizedSlug = slug.replace(/^\/+|\/+$/gu, "");
  if (!normalizedSlug) {
    return;
  }

  const slugDir = path.join(outDir, normalizedSlug);
  fs.mkdirSync(slugDir, { recursive: true });

  const entries = fs.readdirSync(outDir);
  for (const entry of entries) {
    if (entry === normalizedSlug) {
      continue;
    }

    if (ROOT_PRESERVE_ENTRIES.has(entry)) {
      continue;
    }

    const sourcePath = path.join(outDir, entry);
    const targetPath = path.join(slugDir, entry);

    fs.renameSync(sourcePath, targetPath);
  }

  const slugIndexPath = path.join(slugDir, "index.html");
  if (!fs.existsSync(slugIndexPath)) {
    throw new Error(
      `Expected index.html at "${slugIndexPath}" after reorganizing static export for base path "${normalizedSlug}".`,
    );
  }

  const redirectHtml = createRootRedirectHtml(normalizedSlug);
  fs.writeFileSync(path.join(outDir, "index.html"), redirectHtml);

  const root404Path = path.join(outDir, "404.html");
  if (fs.existsSync(root404Path)) {
    const slug404Path = path.join(slugDir, "404.html");
    fs.copyFileSync(root404Path, slug404Path);
  }
}

function ensureNoJekyll(outDir: string): void {
  fs.mkdirSync(outDir, { recursive: true });
  const markerPath = path.join(outDir, ".nojekyll");
  if (fs.existsSync(markerPath)) {
    return;
  }

  fs.writeFileSync(markerPath, "");
}

export function injectGitHubPagesPlaceholders(
  outDir: string,
  basePath: string,
  storageKey: string,
  slug?: string,
): void {
  const root404Path = path.join(outDir, "404.html");
  ensureRedirectTemplate(root404Path);
  if (slug) {
    const slug404Path = path.join(outDir, slug, "404.html");
    ensureRedirectTemplate(slug404Path);
  }
  const normalizedBasePath = normalizeBasePath(basePath);
  const replacements: Array<[string, RegExp]> = [
    [normalizedBasePath, /__BASE_PATH__/gu],
    [storageKey, /__GITHUB_PAGES_REDIRECT_STORAGE_KEY__/gu],
  ];

  const targets = [
    root404Path,
    path.join(outDir, "scripts", "github-pages-bootstrap.js"),
  ];

  if (slug) {
    const slugDir = path.join(outDir, slug);
    targets.push(path.join(slugDir, "404.html"));
    targets.push(path.join(slugDir, "scripts", "github-pages-bootstrap.js"));
  }

  for (const target of targets) {
    if (!fs.existsSync(target)) {
      continue;
    }

    const contents = fs.readFileSync(target, "utf8");
    let updated = contents;
    for (const [value, pattern] of replacements) {
      updated = updated.replace(pattern, value);
    }
    fs.writeFileSync(target, updated);
  }
}

const GITHUB_PAGES_PLACEHOLDERS = [
  "__BASE_PATH__",
  "__GITHUB_PAGES_REDIRECT_STORAGE_KEY__",
] as const;

function ensureRedirectTemplate(targetPath: string): void {
  if (!fs.existsSync(targetPath)) {
    return;
  }

  const existingContents = fs.readFileSync(targetPath, "utf8");
  const hasAllPlaceholders = GITHUB_PAGES_PLACEHOLDERS.every((placeholder) =>
    existingContents.includes(placeholder),
  );

  if (hasAllPlaceholders) {
    return;
  }

  const templatePath = path.resolve("public", "404.html");
  if (!fs.existsSync(templatePath)) {
    throw new Error(
      `Expected GitHub Pages 404 template at "${templatePath}", but it could not be found.`,
    );
  }

  const templateContents = fs.readFileSync(templatePath, "utf8");
  fs.writeFileSync(targetPath, templateContents);
}

export function main(): void {
  applyProductionBasePathDefaults(process.env);

  const requestedPublish = shouldPublishSite(process.env);
  const publish =
    requestedPublish && canPublishWithGit(process.env);
  if (requestedPublish && !publish) {
    console.warn(
      "No git remote named \"origin\" is configured. Generating the static export only. Configure an origin remote or set GITHUB_REPOSITORY and GITHUB_TOKEN to enable publishing.",
    );
  }
  const { slug, ownerSlug: fallbackOwnerSlug } = detectRepositorySlug();
  const { owner: repositoryOwnerSlug, name: repositorySlug } = parseGitHubRepository(
    process.env.GITHUB_REPOSITORY,
  );
  const isUserOrOrgGitHubPage = isUserOrOrgGitHubPagesRepository({
    repositoryOwnerSlug: repositoryOwnerSlug ?? fallbackOwnerSlug,
    repositoryNameSlug: repositorySlug,
    fallbackSlug: slug,
  });
  const shouldUseBasePath = slug.length > 0 && !isUserOrOrgGitHubPage;
  const rawBasePath = shouldUseBasePath ? slug : "";
  const normalizedBasePath = normalizeBasePath(rawBasePath);
  console.log(`Deploying with base path ${normalizedBasePath || "/"}`);

  const buildEnv: NodeJS.ProcessEnv = {
    ...process.env,
    GITHUB_PAGES: "true",
    BASE_PATH: rawBasePath,
    NEXT_PUBLIC_BASE_PATH: normalizedBasePath,
    NEXT_PUBLIC_GITHUB_PAGES: "true",
    SAFE_MODE: process.env.SAFE_MODE ?? "false",
    NEXT_PUBLIC_SAFE_MODE: process.env.NEXT_PUBLIC_SAFE_MODE ?? "false",
  };

  buildStaticSite(pnpmCommand, buildEnv);

  const outDir = path.resolve("out");
  if (shouldUseBasePath) {
    flattenBasePathDirectory(outDir, slug);
  }
  injectGitHubPagesPlaceholders(
    outDir,
    normalizedBasePath,
    GITHUB_PAGES_REDIRECT_STORAGE_KEY,
    shouldUseBasePath ? slug : undefined,
  );
  ensureNoJekyll(outDir);

  if (!publish) {
    console.log("Skipping gh-pages publish step");
    return;
  }

  const ghPagesArgs = createGhPagesArgs(process.env, {
    fallbackBranch: shouldUseBasePath ? "gh-pages" : undefined,
  });
  runCommand(pnpmCommand, ["exec", ...ghPagesArgs], process.env);
}

const entryPoint = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : undefined;

if (process.env.VITEST !== "true" && entryPoint === import.meta.url) {
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
