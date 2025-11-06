import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const isCI = Boolean(process.env.CI)
const pool = isCI ? 'forks' : 'threads'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    include: ['tests/**/*.test.{ts,tsx}', 'tests/**/*.spec.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', 'tests/e2e/**'],
    testTimeout: 20000,
    teardownTimeout: 10000,
    hookTimeout: 10000,
    retry: isCI ? 2 : 0,
    pool,
    maxWorkers: isCI ? 1 : undefined,
    sequence: {
      hooks: 'list',
    },
    coverage: {
      provider: 'istanbul',
      include: [
        'src/ai/**/*.{ts,tsx}',
        'src/hooks/**/*.{ts,tsx}',
        'src/lib/**/*.{ts,tsx}',
        'src/utils/**/*.{ts,tsx}',
      ],
      exclude: [
        'src/components/gallery/generated-manifest.ts',
        'src/components/gallery/generated-manifest.g.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@env': resolve(__dirname, 'env'),
      tests: resolve(__dirname, 'tests'),
    },
  },
})
