import path from "path";
import { fileURLToPath } from "url";
import { baseSecurityHeaders } from "./security-headers.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.GITHUB_PAGES === "true";

const sanitizeSlug = (value) => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }

  const cleaned = trimmed.replace(/^\/+|\/+$/gu, "");
  return cleaned.length > 0 ? cleaned : undefined;
};

const envSlug = sanitizeSlug(process.env.BASE_PATH);
const repositorySlug = sanitizeSlug(process.env.GITHUB_REPOSITORY?.split("/")[1]);
const slug = envSlug ?? repositorySlug;
const normalizedBasePath = slug ? `/${slug}` : undefined;
const isUserOrOrgGitHubPage = (repositorySlug ?? slug)?.endsWith(".github.io") ?? false;
const shouldApplyBasePath = Boolean(isGitHubPages && normalizedBasePath && !isUserOrOrgGitHubPage);

const nextConfig = {
  reactStrictMode: true,
  output: isGitHubPages ? "export" : undefined,
  basePath: shouldApplyBasePath ? normalizedBasePath : undefined,
  assetPrefix: shouldApplyBasePath ? normalizedBasePath : undefined,
  images: {
    unoptimized: isGitHubPages,
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
    NEXT_PUBLIC_BASE_PATH: shouldApplyBasePath ? normalizedBasePath : "",
  },
  async headers() {
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

export default nextConfig;
