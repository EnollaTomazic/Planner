import path from "path";
import { fileURLToPath } from "node:url";
import bundleAnalyzer from "@next/bundle-analyzer";
import {
  createSecurityHeaders,
  defaultSecurityPolicyOptions,
} from "./security-headers.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isProd = process.env.NODE_ENV === "production";

const normalizeBasePath = (rawValue) => {
  const trimmed = rawValue?.trim();

  if (!trimmed) {
    return "";
  }

  const withLeadingSlash = trimmed.startsWith("/")
    ? trimmed
    : `/${trimmed}`;

  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash.slice(0, -1)
    : withLeadingSlash;
};

const resolvedBasePath =
  normalizeBasePath(process.env.BASE_PATH) ||
  normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH);
const basePath = resolvedBasePath || (isProd ? "/Planner" : "");
const assetPrefix = basePath ? `${basePath}/` : "";

const normalizeOptionalBoolean = (value) => {
  if (value === undefined) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return undefined;
};

const explicitExportStatic = normalizeOptionalBoolean(process.env.EXPORT_STATIC);
const isExportStatic = explicitExportStatic ?? isProd;
const isCI = process.env.CI === "true";
const isAnalyzeExplicit = process.env.ANALYZE === "true";
const isDevelopment = process.env.NODE_ENV === "development";

const shouldCollectBundleStats =
  isAnalyzeExplicit ||
  process.env.BUNDLE_GUARD === "true" ||
  (!isExportStatic && (isDevelopment || isCI));
const bundleAnalyzerOutputDir =
  process.env.BUNDLE_ANALYZE_OUTPUT_DIR ?? path.join(".next", "analyze");
const securityPolicyOptions = defaultSecurityPolicyOptions;

const withBundleAnalyzer = bundleAnalyzer({
  enabled: shouldCollectBundleStats,
  openAnalyzer: false,
  analyzerMode: "static",
  reportFilename: path.join(bundleAnalyzerOutputDir, "[name].html"),
  statsFilename: path.join(bundleAnalyzerOutputDir, "[name].json"),
  generateStatsFile: true,
  logLevel: "warn",
});

/** @type {import("next").NextConfig} */
let nextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix,
  productionBrowserSourceMaps: true,
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
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  headers: async () => {
    if (isExportStatic) {
      return [];
    }

    const securityHeaders = createSecurityHeaders(securityPolicyOptions).map(
      (header) => ({ ...header }),
    );

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  webpack: (config, context) => {
    const webpackRef = context?.webpack;

    if (
      webpackRef &&
      typeof webpackRef.WebpackError !== "function" &&
      typeof webpackRef.webpack?.WebpackError === "function"
    ) {
      webpackRef.WebpackError = webpackRef.webpack.WebpackError;
    }

    if (context?.dev) {
      config.devtool = "source-map";
    }

    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    config.resolve.alias["@env"] = path.resolve(__dirname, "env");
    return config;
  },
};

nextConfig = withBundleAnalyzer(nextConfig);

export default nextConfig;
