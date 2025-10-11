import fs from 'node:fs'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ManifestSchema } from '@/components/gallery/manifest.schema'

import {
  loadGeneratedManifest,
  rawJsonManifestErrorMessage,
} from './loadGeneratedManifest'

describe('loadGeneratedManifest helper', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('parses the generated manifest and matches the schema', () => {
    const manifest = loadGeneratedManifest()

    expect(() => ManifestSchema.parse(manifest)).not.toThrow()
    expect(Array.isArray(manifest.galleryPayload.sections)).toBe(true)
    expect(manifest.galleryPayload.sections.length).toBeGreaterThan(0)
  })

  it('throws a descriptive error when the manifest contains raw JSON', () => {
    const manifestPath = path.resolve(
      process.cwd(),
      'src/components/gallery/generated-manifest.ts',
    )
    const originalReadFileSync = fs.readFileSync

    vi.spyOn(fs, 'readFileSync').mockImplementation((file, options) => {
      if (typeof file === 'string' && path.resolve(file) === manifestPath) {
        return '{"galleryPayload":{},"galleryPreviewRoutes":[],"galleryPreviewModules":{}}'
      }

      return originalReadFileSync.call(
        fs,
        file as Parameters<typeof originalReadFileSync>[0],
        options as Parameters<typeof originalReadFileSync>[1],
      )
    })

    expect(() => loadGeneratedManifest()).toThrow(rawJsonManifestErrorMessage)
  })
})
