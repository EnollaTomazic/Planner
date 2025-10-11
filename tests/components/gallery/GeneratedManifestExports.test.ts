import { describe, expect, it } from 'vitest'

import galleryManifest, {
  galleryPayload,
  galleryPreviewModules,
  galleryPreviewRoutes,
} from '@/components/gallery/generated-manifest.g'
import type { GalleryPreviewModuleManifest } from '@/components/gallery/manifest.schema'

import { loadGeneratedManifest } from '../../helpers/loadGeneratedManifest'

describe('gallery manifest exports', () => {
  const manifestFromHelper = loadGeneratedManifest()

  it('exposes the gallery payload', () => {
    expect(manifestFromHelper.galleryPayload).toStrictEqual(galleryPayload)
    expect(galleryManifest.galleryPayload).toBe(galleryPayload)
    expect(galleryPayload).toBeDefined()
    expect(Array.isArray(galleryPayload.sections)).toBe(true)
    expect(galleryPayload.sections.length).toBeGreaterThan(0)
  })

  it('exposes preview route metadata', () => {
    expect(manifestFromHelper.galleryPreviewRoutes).toStrictEqual(
      galleryPreviewRoutes,
    )
    expect(galleryManifest.galleryPreviewRoutes).toBe(galleryPreviewRoutes)
    expect(Array.isArray(galleryPreviewRoutes)).toBe(true)
    expect(galleryPreviewRoutes.length).toBeGreaterThan(0)

    const sampleRoute = galleryPreviewRoutes[0]
    expect(sampleRoute).toBeDefined()
    expect(typeof sampleRoute.slug).toBe('string')
    expect(typeof sampleRoute.previewId).toBe('string')
  })

  it('exposes preview modules with loaders', () => {
    const helperModules = manifestFromHelper.galleryPreviewModules

    expect(Object.keys(helperModules)).toStrictEqual(
      Object.keys(galleryPreviewModules),
    )
    expect(galleryManifest.galleryPreviewModules).toBe(galleryPreviewModules)
    expect(galleryPreviewModules).toBeDefined()
    expect(typeof galleryPreviewModules).toBe('object')

    const manifests = Object.values(galleryPreviewModules)
    expect(manifests.length).toBeGreaterThan(0)

    const moduleManifest = manifests[0] as
      | GalleryPreviewModuleManifest
      | undefined
    expect(moduleManifest).toBeDefined()
    expect(typeof moduleManifest?.loader).toBe('function')
    expect(Array.isArray(moduleManifest?.previewIds)).toBe(true)

    const previewModuleKeys = Object.keys(
      galleryPreviewModules,
    ) as Array<keyof typeof galleryPreviewModules>
    const firstKey = previewModuleKeys[0]
    const helperPreviewIds = helperModules[firstKey]?.previewIds
    const exportedPreviewIds = galleryPreviewModules[firstKey]?.previewIds
    expect(helperPreviewIds).toStrictEqual(exportedPreviewIds)
  })
})
