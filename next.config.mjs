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

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const deriveGitHubPagesBasePath = () => {
  const fromNextPublic = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH);
  if (fromNextPublic) {
    return fromNextPublic;
  }

  const fromBasePath = normalizeBasePath(process.env.BASE_PATH);
  if (fromBasePath) {
    return fromBasePath;
  }

  const repositorySlug = process.env.GITHUB_REPOSITORY?.split("/").pop();
  return normalizeBasePath(repositorySlug);
};

const normalizedBasePathValue = isGitHubPages
  ? deriveGitHubPagesBasePath()
  : normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH);
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
