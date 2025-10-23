import { beforeEach, describe, expect, it } from 'vitest'

import {
  loadGeneratedManifest,
  resetGeneratedManifestCache,
} from 'tests/helpers/loadGeneratedManifest'
import { ManifestSchema } from '@/components/gallery/manifest.schema'

describe('gallery manifest', () => {
  beforeEach(() => {
    resetGeneratedManifestCache()
  })

  it('matches the manifest schema', () => {
    const result = ManifestSchema.safeParse(loadGeneratedManifest())
    if (!result.success) {
      console.error(result.error.format())
    }
    expect(result.success).toBe(true)
  })
})
