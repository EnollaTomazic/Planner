import path from "path";
import { fileURLToPath } from "url";
import { PHASE_EXPORT } from "next/constants";
import { baseSecurityHeaders } from "./security-headers.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sanitizeSlug = (value) => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }

  const cleaned = trimmed.replace(/^\/+|\/+$/gu, "");
  return cleaned.length > 0 ? cleaned : undefined;
};

const normalizedBasePath = (() => {
  const slug = sanitizeSlug(process.env.NEXT_PUBLIC_BASE_PATH);
  return slug ? `/${slug}` : "";
})();

const securityHeaders = async () => {
  return [
    {
      source: "/:path*",
      headers: baseSecurityHeaders.map((header) => ({ ...header })),
    },
  ];
};

const resolveBasePath = () => (normalizedBasePath ? normalizedBasePath : undefined);

/** @type {import('next').NextConfig} */
const createConfig = (phase) => {
  const isExportPhase = phase === PHASE_EXPORT;

  const config = {
    reactStrictMode: true,
    output: "export",
    trailingSlash: true,
    basePath: resolveBasePath(),
    assetPrefix: resolveBasePath(),
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
      NEXT_PUBLIC_BASE_PATH: normalizedBasePath,
    },
    webpack: (config) => {
      config.resolve.alias["@"] = path.resolve(__dirname, "src");
      return config;
    },
  };

  if (!isExportPhase) {
    config.headers = securityHeaders;
  }

  return config;
};

export default createConfig;
