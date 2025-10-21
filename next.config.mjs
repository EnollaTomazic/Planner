import { existsSync, mkdirSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "node:url";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import { gzipSync } from "zlib";
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

const defaultGitHubPagesBasePath = "/Planner";

const isGitHubPages = normalizeOptionalBoolean(process.env.GITHUB_PAGES) ?? false;

const basePath = resolvedBasePath || (isGitHubPages ? defaultGitHubPagesBasePath : "");
const assetPrefix = basePath ? `${basePath}/` : "";

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
const resolvedBundleAnalyzerOutputDir = path.resolve(
  bundleAnalyzerOutputDir,
);
const securityPolicyOptions = defaultSecurityPolicyOptions;

/** @type {import("next").NextConfig} */
let nextConfig = {
  reactStrictMode: true,
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
  webpack: (config, context) => {
    const webpackRef = context?.webpack;

    if (
      webpackRef &&
      typeof webpackRef.WebpackError !== "function" &&
      typeof webpackRef.webpack?.WebpackError === "function"
    ) {
      webpackRef.WebpackError = webpackRef.webpack.WebpackError;
    }

    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    config.resolve.alias["@env"] = path.resolve(__dirname, "env");

    if (shouldCollectBundleStats && !context?.isServer) {
      mkdirSync(resolvedBundleAnalyzerOutputDir, { recursive: true });

      const reportFilename = path.join(
        resolvedBundleAnalyzerOutputDir,
        "client.html",
      );
      const statsFilename = path.join(
        resolvedBundleAnalyzerOutputDir,
        "client.json",
      );

      config.plugins ??= [];
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "static",
          openAnalyzer: false,
          logLevel: "warn",
          reportFilename,
          generateStatsFile: true,
          statsFilename,
        }),
      );
      config.plugins.push(
        new (class BundleStatsPostProcessorPlugin {
          apply(compiler) {
            compiler.hooks.done.tapPromise(
              "BundleStatsPostProcessorPlugin",
              async () => {
                if (!existsSync(statsFilename)) {
                  return;
                }

                let statsData;

                for (let attempt = 0; attempt < 5; attempt += 1) {
                  try {
                    const statsRaw = await readFile(statsFilename, "utf8");
                    statsData = JSON.parse(statsRaw);
                    break;
                  } catch (error) {
                    if (attempt === 4) {
                      console.warn(
                        "BundleStatsPostProcessorPlugin failed to read bundle stats:",
                        error,
                      );
                      return;
                    }

                    await new Promise((resolve) => setTimeout(resolve, 50));
                  }
                }

                if (!statsData) {
                  return;
                }

                const entrypoints =
                  (typeof statsData.entrypoints === "object" && statsData.entrypoints) || {};
                const allowedAssetNames = new Set();

                const includeEntrypointAssets = (name) => {
                  const assetsForEntrypoint = entrypoints?.[name]?.assets;

                  if (!Array.isArray(assetsForEntrypoint)) {
                    return;
                  }

                  for (const assetName of assetsForEntrypoint) {
                    if (typeof assetName === "string") {
                      allowedAssetNames.add(assetName);
                    }
                  }
                };

                includeEntrypointAssets("app");
                includeEntrypointAssets("main-app");
                includeEntrypointAssets("main");
                includeEntrypointAssets("polyfills");

                const shouldKeepAsset = (assetName) => {
                  if (allowedAssetNames.has(assetName)) {
                    return true;
                  }

                  return [
                    "static/chunks/framework",
                    "static/chunks/main",
                    "static/chunks/webpack",
                    "static/chunks/polyfills",
                    "static/chunks/main-app",
                    "static/chunks/app/layout",
                  ].some((prefix) => assetName.startsWith(prefix));
                };

                const assets = Array.isArray(statsData.assets)
                  ? statsData.assets
                  : [];

                const filteredAssets = [];

                for (const asset of assets) {
                  const assetName = asset?.name;

                  if (typeof assetName !== "string" || !assetName.endsWith(".js")) {
                    continue;
                  }

                  if (!shouldKeepAsset(assetName)) {
                    continue;
                  }

                  const assetPath = path.join(compiler.outputPath, assetName);

                  if (!existsSync(assetPath)) {
                    continue;
                  }

                  try {
                    const assetContent = await readFile(assetPath);
                    const gzipSize = gzipSync(assetContent).length;
                    const originalSize = asset.size ?? 0;

                    asset.info = {
                      ...(asset.info ?? {}),
                      gzipSize,
                      originalSize,
                    };
                    asset.size = gzipSize;
                    filteredAssets.push(asset);
                  } catch (error) {
                    console.warn(
                      `BundleStatsPostProcessorPlugin could not process ${assetName}:`,
                      error,
                    );
                  }
                }

                statsData.assets = filteredAssets;

                try {
                  await writeFile(statsFilename, `${JSON.stringify(statsData)}\n`, "utf8");
                } catch (error) {
                  console.warn(
                    "BundleStatsPostProcessorPlugin failed to write processed bundle stats:",
                    error,
                  );
                }
              },
            );
          }
        })(),
      );
    }

    return config;
  },
};

if (!isExportStatic) {
  nextConfig.headers = async () => {
    const securityHeaders = createSecurityHeaders(securityPolicyOptions).map(
      (header) => ({ ...header }),
    );

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  };
}

if (isExportStatic) {
  nextConfig.output = "export";
}

export default nextConfig;
