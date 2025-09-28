import path from "path";
import { fileURLToPath } from "url";
import { baseSecurityHeaders } from "./security-headers.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const normalizeBasePath = (value) => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return "/";
  }

  const cleaned = trimmed.replace(/^\/+|\/+$/gu, "");
  return cleaned ? `/${cleaned}` : "/";
};

const repo = process.env.NEXT_PUBLIC_BASE_PATH ?? "/Planner";
const normalizedRepo = normalizeBasePath(repo);
const isExportStatic = process.env.EXPORT_STATIC === "true";
const isProduction = process.env.NODE_ENV === "production";
const shouldApplyBasePath = (isProduction || isExportStatic) && normalizedRepo !== "/";
const normalizedBasePath = shouldApplyBasePath ? normalizedRepo : undefined;

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
  basePath: normalizedBasePath,
  assetPrefix: normalizedBasePath,
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
    NEXT_PUBLIC_BASE_PATH: shouldApplyBasePath ? normalizedRepo : "",
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
