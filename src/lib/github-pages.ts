// src/lib/github-pages.ts
// Helpers for GitHub Pages routing bootstrap + constants shared with static scripts.

import { STORAGE_PREFIX } from "./storage-key";

export const GITHUB_PAGES_BOOTSTRAP_SCRIPT_PATH = "/scripts/github-pages-bootstrap.js";
export const GITHUB_PAGES_REDIRECT_STORAGE_KEY = `${STORAGE_PREFIX}gh-pages:redirect`;
export const GITHUB_PAGES_STORAGE_PLACEHOLDER = "__GITHUB_PAGES_REDIRECT_STORAGE_KEY__";
export const GITHUB_PAGES_BASE_PATH_PLACEHOLDER = "__BASE_PATH__";

const ABSOLUTE_URL_PATTERN = /^[a-zA-Z][a-zA-Z\d+.-]*:/u;

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
  if (!raw) {
    return "";
  }

  const trimmed = raw.trim();
  if (!trimmed || trimmed === "/") {
    return "";
  }

  const segments = trimmed
    .split("/")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

  if (segments.length === 0) {
    return "";
  }

  return `/${segments.join("/")}`;
}

export function isGitHubPagesIndexPath(path: string, basePath: string): boolean {
  const normalizedBase = normalizeGitHubPagesBasePath(basePath);
  const candidates = new Set<string>();
  const root = normalizedBase || "/";
  candidates.add(root);
  candidates.add(`${root.replace(/\/$/u, "")}/index.html`);
  return candidates.has(path);
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

  if (target === input.currentPath) {
    return null;
  }

  return target;
}
