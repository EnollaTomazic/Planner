import path from "path";
import { defineConfig } from "vitest/config";

const isCI = Boolean(process.env.CI);

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: "./tests/setup.ts",
    include: ["tests/**/*.test.{ts,tsx}", "tests/**/*.spec.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**"],
    testTimeout: 15000,
    ...(isCI
      ? {
          poolOptions: {
            threads: {
              minThreads: 1,
              maxThreads: 1,
            },
          },
        }
      : {}),
    coverage: {
      provider: "istanbul",
      include: ["src/**/*.{ts,tsx}", "app/**/*.{ts,tsx}"],
      exclude: [
        "src/components/gallery/generated-manifest.ts",
        "src/components/gallery/generated-manifest.g.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
