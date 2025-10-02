import path from "node:path";
import { fileURLToPath } from "node:url";

import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

import { env as serverEnv } from "./src/env/server";
import { baseSecurityHeaders } from "./security-headers.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const resolveGitHubPagesSlug = (): string => {
  const explicitSlugSources = [
    serverEnv.NEXT_PUBLIC_BASE_PATH,
    serverEnv.BASE_PATH,
  ] as const;

  for (const candidate of explicitSlugSources) {
    if (candidate.provided) {
      const raw = candidate.raw?.trim() ?? "";

      if (raw.length === 0) {
        return "";
      }

      if (candidate.slug.length > 0) {
        return candidate.slug;
      }

      return "";
    }
  }

  if (serverEnv.repositorySlug) {
    return serverEnv.repositorySlug;
  }

  return "";
};

const githubPagesSlug = serverEnv.GITHUB_PAGES ? resolveGitHubPagesSlug() : "";
const isUserOrOrgGitHubPage =
  (serverEnv.repositorySlug ?? githubPagesSlug)?.endsWith(".github.io") ?? false;

const resolvedBasePathSetting = serverEnv.NEXT_PUBLIC_BASE_PATH.provided
  ? serverEnv.NEXT_PUBLIC_BASE_PATH.normalized
  : serverEnv.BASE_PATH.normalized;

const normalizedBasePathValue = serverEnv.GITHUB_PAGES
  ? githubPagesSlug && !isUserOrOrgGitHubPage
    ? `/${githubPagesSlug}`
    : ""
  : resolvedBasePathSetting;

const shouldApplyBasePath = normalizedBasePathValue.length > 0;
const nextBasePath = shouldApplyBasePath ? normalizedBasePathValue : undefined;
const nextAssetPrefix = shouldApplyBasePath ? normalizedBasePathValue : undefined;

const shouldCollectBundleStats =
  !serverEnv.EXPORT_STATIC &&
  (serverEnv.NODE_ENV === "development" || serverEnv.CI || serverEnv.ANALYZE);

const withBundleAnalyzer = bundleAnalyzer({
  enabled: shouldCollectBundleStats,
  openAnalyzer: false,
  analyzerMode: "static",
  logLevel: "warn",
});

let nextConfig: NextConfig = {
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
    if (serverEnv.NODE_ENV === "production" || serverEnv.EXPORT_STATIC) {
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
};

nextConfig = withBundleAnalyzer(nextConfig);

export default nextConfig;
