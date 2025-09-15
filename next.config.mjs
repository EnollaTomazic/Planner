import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const isGitHubPages = Boolean(process.env.GITHUB_PAGES);

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: isGitHubPages ? "/Planner" : undefined,
  assetPrefix: isGitHubPages ? "/Planner" : undefined,
  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    return config;
  },
};

export default nextConfig;
