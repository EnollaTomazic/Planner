import { readLocal, writeLocal, removeLocal } from './db'
import { persistenceLogger } from './logging'

export const VECTOR_STORE_KEY = 'vector-store'

export type VectorStoreEntry = {
  id: string
  hash: string
  vector: Float32Array
  createdAt: number
  updatedAt: number
}

export type VectorStoreSnapshot = {
  version: 1
  entries: VectorStoreEntry[]
}

type RawVectorStore = {
  version?: unknown
  entries?: unknown
}

type NormalizeResult = {
  entries: VectorStoreEntry[]
  removedInvalid: string[]
  removedDuplicates: string[]
}

const DEFAULT_SNAPSHOT: VectorStoreSnapshot = {
  version: 1,
  entries: [],
}

const FALLBACK_TIMESTAMP = 0

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function toFloat32Array(candidate: unknown): Float32Array | null {
  if (candidate instanceof Float32Array) {
    return candidate
  }

  if (Array.isArray(candidate)) {
    if (candidate.every((value) => typeof value === 'number' && Number.isFinite(value))) {
      return Float32Array.from(candidate)
    }
    return null
  }

  if (candidate instanceof ArrayBuffer) {
    return new Float32Array(candidate.slice(0))
  }

  if (ArrayBuffer.isView(candidate)) {
    if (candidate instanceof DataView) {
      return null
    }
    const view = candidate as Exclude<ArrayBufferView, DataView>
    const buffer = view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength)
    return new Float32Array(buffer)
  }

  return null
}

function normalizeEntry(candidate: unknown): VectorStoreEntry | null {
  if (!candidate || typeof candidate !== 'object') {
    return null
  }

  const { id, hash, vector, createdAt, updatedAt } = candidate as Partial<VectorStoreEntry>

  if (typeof id !== 'string' || id.trim().length === 0) {
    return null
  }

  if (typeof hash !== 'string' || hash.trim().length === 0) {
    return null
  }

  const normalizedVector = toFloat32Array(vector)
  if (!normalizedVector || normalizedVector.length === 0) {
    return null
  }

  const trimmedId = id.trim()
  const trimmedHash = hash.trim()

  const normalizedCreatedAt = isFiniteNumber(createdAt) ? createdAt : FALLBACK_TIMESTAMP
  const normalizedUpdatedAt = isFiniteNumber(updatedAt)
    ? updatedAt
    : normalizedCreatedAt

  return {
    id: trimmedId,
    hash: trimmedHash,
    vector: normalizedVector,
    createdAt: normalizedCreatedAt,
    updatedAt: normalizedUpdatedAt,
  }
}

export function purgeInvalidEntries(
  entries: readonly unknown[],
): { entries: VectorStoreEntry[]; removedIds: string[] } {
  const sanitized: VectorStoreEntry[] = []
  const removedIds: string[] = []

  for (const entry of entries) {
    const normalized = normalizeEntry(entry)
    if (normalized) {
      sanitized.push(normalized)
      continue
    }

    if (entry && typeof entry === 'object') {
      const maybeId = (entry as { id?: unknown }).id
      if (typeof maybeId === 'string' && maybeId.trim().length > 0) {
        removedIds.push(maybeId.trim())
      }
    }
  }

  return { entries: sanitized, removedIds }
}

export function deduplicateEntries(
  entries: readonly VectorStoreEntry[],
): { entries: VectorStoreEntry[]; removedIds: string[] } {
  const survivors: VectorStoreEntry[] = []
  const removedIds: string[] = []
  const indexByHash = new Map<string, number>()

  for (const entry of entries) {
    const existingIndex = indexByHash.get(entry.hash)
    if (existingIndex === undefined) {
      survivors.push(entry)
      indexByHash.set(entry.hash, survivors.length - 1)
      continue
    }

    const existing = survivors[existingIndex]
    const existingScore = (isFiniteNumber(existing.updatedAt) ? existing.updatedAt : FALLBACK_TIMESTAMP) * 1e6 +
      (isFiniteNumber(existing.createdAt) ? existing.createdAt : FALLBACK_TIMESTAMP)
    const candidateScore = (isFiniteNumber(entry.updatedAt) ? entry.updatedAt : FALLBACK_TIMESTAMP) * 1e6 +
      (isFiniteNumber(entry.createdAt) ? entry.createdAt : FALLBACK_TIMESTAMP)

    if (candidateScore > existingScore) {
      removedIds.push(existing.id)
      survivors[existingIndex] = entry
      continue
    }

    if (candidateScore < existingScore) {
      removedIds.push(entry.id)
      continue
    }

    if (entry.id.localeCompare(existing.id) > 0) {
      removedIds.push(entry.id)
      continue
    }

    removedIds.push(existing.id)
    survivors[existingIndex] = entry
  }

  return { entries: survivors, removedIds }
}

function normalizeEntries(rawEntries: readonly unknown[]): NormalizeResult {
  const purged = purgeInvalidEntries(rawEntries)
  const deduped = deduplicateEntries(purged.entries)

  return {
    entries: deduped.entries,
    removedInvalid: purged.removedIds,
    removedDuplicates: deduped.removedIds,
  }
}

function readRawSnapshot(): RawVectorStore | null {
  return readLocal<RawVectorStore>(VECTOR_STORE_KEY)
}

export function ensureVectorStoreIntegrity(): VectorStoreSnapshot {
  const rawSnapshot = readRawSnapshot()
  const rawEntries = Array.isArray(rawSnapshot?.entries) ? rawSnapshot?.entries ?? [] : []
  const { entries, removedInvalid, removedDuplicates } = normalizeEntries(rawEntries)

  const snapshot: VectorStoreSnapshot = {
    version: 1,
    entries,
  }

  const shouldPersist =
    rawSnapshot?.version !== 1 ||
    removedInvalid.length > 0 ||
    removedDuplicates.length > 0 ||
    (Array.isArray(rawSnapshot?.entries) && rawSnapshot!.entries.length !== entries.length)

  if (shouldPersist) {
    if (removedInvalid.length > 0 || removedDuplicates.length > 0) {
      persistenceLogger.info('vector-store maintenance pruned entries', {
        removedInvalid,
        removedDuplicates,
      })
    }
    writeLocal(VECTOR_STORE_KEY, snapshot)
  }

  return snapshot
}

export function loadVectorStore(): VectorStoreSnapshot {
  const rawSnapshot = readRawSnapshot()
  if (!rawSnapshot) {
    return DEFAULT_SNAPSHOT
  }

  const rawEntries = Array.isArray(rawSnapshot.entries) ? rawSnapshot.entries : []
  const { entries } = normalizeEntries(rawEntries)

  return {
    version: 1,
    entries,
  }
}

export function saveVectorStore(snapshot: VectorStoreSnapshot): VectorStoreSnapshot {
  const { entries } = normalizeEntries(snapshot.entries)
  const sanitized: VectorStoreSnapshot = {
    version: 1,
    entries,
  }

  writeLocal(VECTOR_STORE_KEY, sanitized)

  return sanitized
}

export function upsertVectorEntry(entry: VectorStoreEntry): VectorStoreSnapshot {
  const snapshot = ensureVectorStoreIntegrity()
  const withoutId = snapshot.entries.filter((existing) => existing.id !== entry.id)
  const merged = [...withoutId, entry]
  const { entries } = deduplicateEntries(merged)
  const sanitized: VectorStoreSnapshot = {
    version: 1,
    entries,
  }

  writeLocal(VECTOR_STORE_KEY, sanitized)
  return sanitized
}

export function removeVectorEntries(ids: readonly string[]): VectorStoreSnapshot {
  if (ids.length === 0) {
    return ensureVectorStoreIntegrity()
  }

  const snapshot = ensureVectorStoreIntegrity()
  const targets = new Set(ids)
  const retained = snapshot.entries.filter((entry) => !targets.has(entry.id))
  const sanitized: VectorStoreSnapshot = {
    version: 1,
    entries: retained,
  }

  writeLocal(VECTOR_STORE_KEY, sanitized)
  return sanitized
}

export function clearVectorStore() {
  removeLocal(VECTOR_STORE_KEY)
}

