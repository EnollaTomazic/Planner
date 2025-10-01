import path from "path";
import { fileURLToPath } from "url";
import bundleAnalyzer from "@next/bundle-analyzer";
import { baseSecurityHeaders } from "./security-headers.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const collectPathSegments = (value) => {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === "/") {
    return [];
  }

  return trimmed
    .split("/")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
};

const normalizeBasePath = (value) => {
  const segments = collectPathSegments(value);
  return segments.length > 0 ? `/${segments.join("/")}` : "";
};

const normalizeSlug = (value) => {
  const segments = collectPathSegments(value);
  return segments.length > 0 ? segments.join("/") : undefined;
};

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const repositorySlug = normalizeSlug(process.env.GITHUB_REPOSITORY?.split("/").pop());

const resolveGitHubPagesSlug = () => {
  const explicitSlugSources = [process.env.NEXT_PUBLIC_BASE_PATH, process.env.BASE_PATH];

  for (const candidate of explicitSlugSources) {
    if (candidate !== undefined) {
      const trimmed = candidate.trim();

      if (trimmed.length === 0) {
        return "";
      }

      const normalized = normalizeSlug(candidate);

      if (normalized !== undefined) {
        return normalized;
      }

      return "";
    }
  }

  if (repositorySlug) {
    return repositorySlug;
  }

  return "";
};

const githubPagesSlug = isGitHubPages ? resolveGitHubPagesSlug() : "";
const isUserOrOrgGitHubPage = (repositorySlug ?? githubPagesSlug)?.endsWith(".github.io") ?? false;

const normalizedBasePathValue = isGitHubPages
  ? githubPagesSlug && !isUserOrOrgGitHubPage
    ? `/${githubPagesSlug}`
    : ""
  : normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH ?? process.env.BASE_PATH ?? "");
const isExportStatic = process.env.EXPORT_STATIC === "true";
const isProduction = process.env.NODE_ENV === "production";
const isCI = process.env.CI === "true";
const isAnalyzeExplicit = process.env.ANALYZE === "true";
const isDevelopment = process.env.NODE_ENV === "development";
const shouldApplyBasePath = normalizedBasePathValue.length > 0;
const nextBasePath = shouldApplyBasePath ? normalizedBasePathValue : undefined;
const nextAssetPrefix = shouldApplyBasePath ? normalizedBasePathValue : undefined;

const shouldCollectBundleStats = !isExportStatic && (isDevelopment || isCI || isAnalyzeExplicit);

const withBundleAnalyzer = bundleAnalyzer({
  enabled: shouldCollectBundleStats,
  openAnalyzer: false,
  analyzerMode: "static",
  logLevel: "warn",
});

export default withBundleAnalyzer({
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  basePath: nextBasePath,
  assetPrefix: nextAssetPrefix,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: normalizedBasePathValue,
  },
  headers: async () => {
    if (isProduction || isExportStatic) {
      return [];
    }

    return [
      {
        source: "/:path*",
        headers: baseSecurityHeaders.map((header) => ({ ...header })),
      },
    ];
  },
  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    return config;
  },
});
