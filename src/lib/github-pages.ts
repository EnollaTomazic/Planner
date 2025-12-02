// src/lib/github-pages.ts
// Helpers for GitHub Pages routing bootstrap + constants shared with static scripts.

import path from "node:path";

import { normalizeBasePath } from "../../lib/base-path.js";
import { createStorageKey } from "./storage-key";

export const GITHUB_PAGES_BOOTSTRAP_SCRIPT_PATH = "/scripts/github-pages-bootstrap.js";
export const GITHUB_PAGES_REDIRECT_STORAGE_KEY = createStorageKey(
  "gh-pages:redirect",
);

const ABSOLUTE_URL_PATTERN = /^[a-zA-Z][a-zA-Z\d+.-]*:/u;
const GITHUB_PAGES_DEPLOY_ALIAS_PATTERN = /^[0-9a-f]{7,40}$/iu;
const GITHUB_PAGES_BRANCH_ALIASES = new Set([
  "current",
  "main",
  "master",
  "pages",
]);

function normalizeGitHubPagesDeploymentAlias(
  target: string,
  normalizedBase: string,
): string {
  if (!target) {
    return target;
  }

  const parsedTarget = new URL(target, "http://localhost");
  const suffix = `${parsedTarget.search}${parsedTarget.hash}`;
  const root = normalizedBase || "/";
  const normalizedRoot = root === "" ? "/" : root;

  const relativeToBase = path.posix.relative(normalizedRoot, parsedTarget.pathname);
  const isOutsideBase =
    relativeToBase.startsWith("..") || path.posix.isAbsolute(relativeToBase);
  if (isOutsideBase) {
    return target;
  }

  const [alias, ...rest] = relativeToBase.split("/").filter(Boolean);
  if (!alias) {
    return target;
  }

  const normalizedAlias = alias.toLowerCase();
  const isCommitAlias = GITHUB_PAGES_DEPLOY_ALIAS_PATTERN.test(alias);
  const isAlias = GITHUB_PAGES_BRANCH_ALIASES.has(normalizedAlias) || isCommitAlias;
  if (!isAlias) {
    return target;
  }

  if (rest.length === 0 || (rest.length === 1 && rest[0] === "index.html")) {
    return `${normalizedRoot}${suffix}`;
  }

  const targetPath = path.posix.join(normalizedRoot, rest.join("/"));
  return `${targetPath}${suffix}`;
}

export function normalizePlaceholder(
  placeholderValue: string,
  placeholder: string,
  fallback: string,
): string {
  const normalizedPlaceholder = placeholderValue ?? "";
  if (normalizedPlaceholder === placeholder) {
    return fallback;
  }
  const trimmed = normalizedPlaceholder.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export function normalizeGitHubPagesBasePath(raw: string): string {
  return normalizeBasePath(raw);
}

export function isGitHubPagesIndexPath(path: string, basePath: string): boolean {
  const [withoutHash] = path.split("#", 1);
  const [pathname] = withoutHash.split("?", 1);
  const sanitizedPathname = pathname.length > 0 ? pathname : "/";
  const normalizedPath = sanitizedPathname.replace(/\/+$/u, "") || "/";
  const normalizedBase = normalizeGitHubPagesBasePath(basePath);
  const candidates = new Set<string>();
  const root = normalizedBase || "/";
  candidates.add(root);
  candidates.add(`${root.replace(/\/$/u, "")}/index.html`);
  return candidates.has(normalizedPath);
}

export function sanitizeStoredLocation(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (ABSOLUTE_URL_PATTERN.test(trimmed) || trimmed.startsWith("//")) {
    return null;
  }
  return trimmed;
}

export interface GitHubPagesRestorationPlanInput {
  currentPath: string;
  storedLocation: unknown;
  basePath: string;
}

export function planGitHubPagesRestoration(
  input: GitHubPagesRestorationPlanInput,
): string | null {
  const normalizedBase = normalizeGitHubPagesBasePath(input.basePath);
  const candidate = sanitizeStoredLocation(input.storedLocation);
  if (!candidate) {
    return null;
  }

  let target = candidate;
  if (!target.startsWith("/")) {
    target = `/${target}`;
  }

  if (normalizedBase && !target.startsWith(normalizedBase)) {
    const suffix = target.startsWith("/") ? target : `/${target}`;
    target = `${normalizedBase}${suffix}`;
  }

  target = normalizeGitHubPagesDeploymentAlias(target, normalizedBase);

  if (target === input.currentPath) {
    return null;
  }

  return target;
}
