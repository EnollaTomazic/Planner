import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.GITHUB_PAGES === "true";

const repositorySlug = process.env.BASE_PATH ?? process.env.GITHUB_REPOSITORY?.split("/")[1];
const trimmedSlug = repositorySlug?.trim();
const cleanSlug = trimmedSlug?.replace(new RegExp("^/+|/+$", "g"), "");
const normalizedBasePath = cleanSlug ? `/${cleanSlug}` : undefined;

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: isGitHubPages ? normalizedBasePath : undefined,
  assetPrefix: isGitHubPages ? normalizedBasePath : undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: isGitHubPages ? normalizedBasePath ?? "" : "",
  },
  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    return config;
  },
};

export default nextConfig;
