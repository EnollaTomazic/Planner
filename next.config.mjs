import path from "path";
import { fileURLToPath } from "url";
import { baseSecurityHeaders } from "./security-headers.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const normalizeBasePath = (value) => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return "";
  }

  const cleaned = trimmed.replace(/^\/+|\/+$/gu, "");
  return cleaned ? `/${cleaned}` : "";
};

const sanitizeSlug = (value) => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }

  const cleaned = trimmed.replace(/^\/+|\/+$/gu, "");
  return cleaned.length > 0 ? cleaned : undefined;
};

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const repositorySlug = sanitizeSlug(process.env.GITHUB_REPOSITORY?.split("/").pop());

const resolveGitHubPagesSlug = () => {
  const explicitSlug =
    sanitizeSlug(process.env.NEXT_PUBLIC_BASE_PATH) ??
    sanitizeSlug(process.env.BASE_PATH);

  if (explicitSlug) {
    return explicitSlug;
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
