import "./check-node-version.js";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";

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
  const fromEnv = sanitizeSlug(process.env.BASE_PATH);
  if (fromEnv) {
    return fromEnv;
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

function main(): void {
  const slug = detectRepositorySlug();
  const basePath = `/${slug}`;
  console.log(`Deploying with base path ${basePath}`);

  const buildEnv: NodeJS.ProcessEnv = {
    ...process.env,
    GITHUB_PAGES: "true",
    BASE_PATH: slug,
  };

  runCommand(npmCommand, ["run", "build"], buildEnv);
  runCommand(npxCommand, ["gh-pages", "-d", "out", "-b", "gh-pages"], process.env);
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
