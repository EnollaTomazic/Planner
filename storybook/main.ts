import path from "node:path";
import { fileURLToPath } from "node:url";
import { mergeConfig } from "vite";
import type { StorybookConfig } from "@storybook/react-vite";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ["./src/components/**/*.stories.@(js|jsx|ts|tsx|mdx)"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (config) =>
    mergeConfig(config, {
      resolve: {
        alias: {
          "@": path.resolve(dirname, "../src"),
          "@env": path.resolve(dirname, "../env"),
        },
      },
    }),
};

export default config;
