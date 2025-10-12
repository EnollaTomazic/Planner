import path from "node:path";
import { mergeConfig } from "vite";
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["./src/components/**/*.stories.@(js|jsx|ts|tsx|mdx)"],
  framework: {
    name: "@storybook/react-vite",
  },
  viteFinal: async (config) =>
    mergeConfig(config, {
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "../src"),
          "@env": path.resolve(__dirname, "../env"),
        },
      },
    }),
};

export default config;
