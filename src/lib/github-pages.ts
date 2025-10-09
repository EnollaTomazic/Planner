// src/lib/github-pages.ts
// Helpers for GitHub Pages routing bootstrap + constants shared with static scripts.

import { normalizeBasePath } from "../../lib/base-path.js";
import { createStorageKey } from "./storage-key";

export const GITHUB_PAGES_BOOTSTRAP_SCRIPT_PATH = "/scripts/github-pages-bootstrap.js";
export const GITHUB_PAGES_REDIRECT_STORAGE_KEY = createStorageKey(
  "gh-pages:redirect",
);
export const GITHUB_PAGES_STORAGE_PLACEHOLDER = "__GITHUB_PAGES_REDIRECT_STORAGE_KEY__";
export const GITHUB_PAGES_BASE_PATH_PLACEHOLDER = "__BASE_PATH__";

const ABSOLUTE_URL_PATTERN = /^[a-zA-Z][a-zA-Z\d+.-]*:/u;
const GITHUB_PAGES_DEPLOY_ALIAS_PATTERN = /^[0-9a-f]{7,40}$/iu;

function normalizeGitHubPagesDeploymentAlias(
  target: string,
  normalizedBase: string,
): string {
  if (!target) {
    return target;
  }

  const queryIndex = target.search(/[?#]/u);
  const pathname = queryIndex === -1 ? target : target.slice(0, queryIndex);
  const suffix = queryIndex === -1 ? "" : target.slice(queryIndex);
  const root = normalizedBase || "/";

  if (!pathname.startsWith(root)) {
    return target;
  }

  if (root !== "/" && pathname.length > root.length) {
    const boundary = pathname.charAt(root.length);
    if (boundary !== "/") {
      return target;
    }
  }

  const remainder = pathname.slice(root.length).replace(/^\/+/, "");
  if (!remainder) {
    return target;
  }

  const segments = remainder
    .split("/")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

  if (segments.length === 0) {
    return target;
  }

  const [alias, ...rest] = segments;
  const normalizedAlias = alias.toLowerCase();
  const isCommitAlias = GITHUB_PAGES_DEPLOY_ALIAS_PATTERN.test(alias);
  const isAlias = normalizedAlias === "current" || isCommitAlias;

  if (!isAlias) {
    return target;
  }

  if (rest.length === 0 || (rest.length === 1 && rest[0] === "index.html")) {
    return `${root}${suffix}`;
  }

  return target;
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
