import path from "path";
import { fileURLToPath } from "url";
import { baseSecurityHeaders } from "./security-headers.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const normalizeBasePath = (value) => {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();
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
};

const normalizeSlug = (value) => {
  const normalized = normalizeBasePath(value);
  return normalized ? normalized.slice(1) : undefined;
};

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const repositorySlug = normalizeSlug(process.env.GITHUB_REPOSITORY?.split("/").pop());

const resolveGitHubPagesSlug = () => {
  const explicitSlugSources = [process.env.NEXT_PUBLIC_BASE_PATH, process.env.BASE_PATH];

  for (const candidate of explicitSlugSources) {
    if (candidate !== undefined) {
      const normalized = normalizeBasePath(candidate);

      if (!normalized) {
        return "";
      }

      return normalized.slice(1);
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
const shouldApplyBasePath = normalizedBasePathValue.length > 0;
const nextBasePath = shouldApplyBasePath ? normalizedBasePathValue : undefined;
const nextAssetPrefix = shouldApplyBasePath ? normalizedBasePathValue : undefined;

const securityHeaders = async () => {
  return [
    {
      source: "/:path*",
      headers: baseSecurityHeaders.map((header) => ({ ...header })),
    },
  ];
};

const nextConfig = {
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
  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    return config;
  },
};

if (!(isProduction || isExportStatic)) {
  nextConfig.headers = securityHeaders;
}

export default nextConfig;
