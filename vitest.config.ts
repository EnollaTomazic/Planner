import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    // Limit vitest to a single worker across all pools to avoid high memory usage
    // during collection/execution of the massive generated fixture set in this repo.
    fileParallelism: false,
    maxWorkers: 1,
    minWorkers: 1,
    poolOptions: {
      threads: {
        singleThread: true,
      },
      vmThreads: {
        singleThread: true,
      },
      forks: {
        singleFork: true,
      },
      vmForks: {
        singleFork: true,
      },
    },
  },
});
