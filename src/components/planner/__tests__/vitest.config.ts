import { resolve } from 'node:path'
import baseConfig from '../../../../vitest.config'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  ...baseConfig,
  root: resolve(__dirname, '../../../../'),
  test: {
    ...baseConfig.test,
    setupFiles: resolve(__dirname, '../../../../tests/setup.ts'),
    include: [
      resolve(__dirname, './plannerSerialization.test.ts'),
      '**/*.test.{ts,tsx}',
      '**/*.spec.{ts,tsx}',
      '../goals/__tests__/**/*.test.{ts,tsx}',
      '../goals/__tests__/**/*.spec.{ts,tsx}',
    ],
  },
})
