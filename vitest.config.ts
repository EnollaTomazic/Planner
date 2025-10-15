import path from "path";
import { defineConfig } from "vitest/config";

const isCI = Boolean(process.env.CI);
const pool = isCI ? "forks" : "threads";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: "./tests/setup.ts",
    include: ["tests/**/*.test.{ts,tsx}", "tests/**/*.spec.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**"],
    testTimeout: 20000,
    teardownTimeout: 10000,
    hookTimeout: 10000,
    retry: isCI ? 2 : 0,
    pool,
    poolOptions: {
      threads: {
        isolate: true,
        maxThreads: isCI ? 2 : undefined,
        minThreads: 1,
      },
      forks: {
        isolate: true,
        singleFork: isCI,
      },
    },
    sequence: {
      hooks: "list",
    },
    coverage: {
      provider: "istanbul",
      include: [
        "src/ai/**/*.{ts,tsx}",
        "src/hooks/**/*.{ts,tsx}",
        "src/lib/**/*.{ts,tsx}",
        "src/utils/**/*.{ts,tsx}",
      ],
      exclude: [
        "src/components/gallery/generated-manifest.ts",
        "src/components/gallery/generated-manifest.g.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@env": path.resolve(__dirname, "env"),
    },
  },
});
