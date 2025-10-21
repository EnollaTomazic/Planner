import fs from 'node:fs'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ManifestSchema } from '@/components/gallery/manifest.schema'

import {
  loadGeneratedManifest,
  rawJsonManifestErrorMessage,
  resetGeneratedManifestCache,
} from './loadGeneratedManifest'

describe('loadGeneratedManifest helper', () => {
  afterEach(() => {
    resetGeneratedManifestCache()
    vi.restoreAllMocks()
  })

  it('parses the generated manifest and matches the schema', () => {
    const manifest = loadGeneratedManifest()

    expect(() => ManifestSchema.parse(manifest)).not.toThrow()
    expect(Array.isArray(manifest.galleryPayload.sections)).toBe(true)
    expect(manifest.galleryPayload.sections.length).toBeGreaterThan(0)
  })

  it('reuses the cached manifest instance within the same worker', () => {
    const manifestPath = path.resolve(
      process.cwd(),
      'src/components/gallery/generated-manifest.runtime.json',
    )
    const readSpy = vi.spyOn(fs, 'readFileSync')

    const first = loadGeneratedManifest()
    const second = loadGeneratedManifest()

    expect(first).toBe(second)
    expect(readSpy).toHaveBeenCalledTimes(1)
    expect(readSpy).toHaveBeenCalledWith(manifestPath, 'utf-8')
  })

  it('throws a descriptive error when the runtime manifest is invalid', () => {
    const manifestPath = path.resolve(
      process.cwd(),
      'src/components/gallery/generated-manifest.runtime.json',
    )
    const originalReadFileSync = fs.readFileSync

    vi.spyOn(fs, 'readFileSync').mockImplementation((file, options) => {
      if (typeof file === 'string' && path.resolve(file) === manifestPath) {
        return 'not json'
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
