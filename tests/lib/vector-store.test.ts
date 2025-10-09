import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const originalLocalStorage = window.localStorage
const originalStorageEvent = window.StorageEvent

type StorageMock = ReturnType<typeof createMockStorage>

type StorageRecord = Record<string, unknown>

function createMockStorage() {
  const store = new Map<string, string>()

  const getItem = vi.fn((key: string) => (store.has(key) ? store.get(key)! : null))
  const setItem = vi.fn((key: string, value: string) => {
    store.set(key, value)
  })
  const removeItem = vi.fn((key: string) => {
    store.delete(key)
  })
  const clear = vi.fn(() => {
    store.clear()
  })
  const key = vi.fn((index: number) => Array.from(store.keys())[index] ?? null)

  const storage = {
    getItem,
    setItem,
    removeItem,
    clear,
    key,
  } as StorageRecord

  Object.defineProperty(storage, 'length', {
    configurable: true,
    get: () => store.size,
  })

  return {
    store,
    storage: storage as Storage,
    getItem,
    setItem,
    removeItem,
    clear,
    key,
  }
}

class MockStorageEvent extends Event {
  readonly key: string | null
  readonly newValue: string | null
  readonly oldValue: string | null
  readonly storageArea: Storage | null
  readonly url: string

  constructor(type: string, init: StorageEventInit = {}) {
    super(type, init)
    this.key = init.key ?? null
    this.newValue = init.newValue ?? null
    this.oldValue = init.oldValue ?? null
    this.storageArea = init.storageArea ?? null
    this.url = init.url ?? ''
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initStorageEvent(
    _type?: string,
    _bubbles?: boolean,
    _cancelable?: boolean,
    _key?: string | null,
    _oldValue?: string | null,
    _newValue?: string | null,
    _url?: string | null,
    _storageArea?: Storage | null,
  ) {}
}

let storageMock: StorageMock

beforeEach(() => {
  vi.resetModules()
  storageMock = createMockStorage()

  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: storageMock.storage,
  })

  vi.stubGlobal('StorageEvent', MockStorageEvent as unknown as typeof StorageEvent)
  delete (window as { __planner_flush_bound?: boolean }).__planner_flush_bound
  vi.useFakeTimers()
})

afterEach(() => {
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: originalLocalStorage,
  })

  vi.unstubAllGlobals()
  if (originalStorageEvent) {
    Object.defineProperty(window, 'StorageEvent', {
      configurable: true,
      value: originalStorageEvent,
    })
  }

  vi.clearAllMocks()
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.resetModules()
  delete (window as { __planner_flush_bound?: boolean }).__planner_flush_bound
})

describe('vector-store', () => {
  it('purgeInvalidEntries removes entries lacking vectors', async () => {
    const { purgeInvalidEntries } = await import('@/lib/vector-store')

    const vector = new Float32Array([1, 2, 3])

    const { entries, removedIds } = purgeInvalidEntries([
      {
        id: 'valid-entry',
        hash: 'hash-1',
        vector,
        createdAt: 2,
        updatedAt: 5,
      },
      {
        id: 'missing-vector',
        hash: 'hash-2',
      },
      {
        id: 'empty-vector',
        hash: 'hash-3',
        vector: [],
      },
    ])

    expect(entries).toHaveLength(1)
    expect(entries[0].id).toBe('valid-entry')
    expect(Array.from(entries[0].vector)).toEqual([1, 2, 3])
    expect(removedIds).toEqual(['missing-vector', 'empty-vector'])
  })

  it('ensureVectorStoreIntegrity removes duplicate hashes and persists sanitized data', async () => {
    const { createStorageKey } = await import('@/lib/storage-key')
    const { ensureVectorStoreIntegrity, VECTOR_STORE_KEY } = await import('@/lib/vector-store')
    const { setWriteLocalDelay, flushWriteLocal } = await import('@/lib/db')

    const storageKey = createStorageKey(VECTOR_STORE_KEY)

    const seeded = {
      version: 1,
      entries: [
        {
          id: 'older',
          hash: 'duplicate-hash',
          vector: [1, 1, 1],
          createdAt: 1,
          updatedAt: 1,
        },
        {
          id: 'newer',
          hash: 'duplicate-hash',
          vector: [2, 2, 2],
          createdAt: 2,
          updatedAt: 5,
        },
        {
          id: 'unique',
          hash: 'unique-hash',
          vector: [3, 3, 3],
          createdAt: 3,
          updatedAt: 3,
        },
      ],
    }

    window.localStorage.setItem(storageKey, JSON.stringify(seeded))
    storageMock.setItem.mockClear()
    setWriteLocalDelay(0)

    const snapshot = ensureVectorStoreIntegrity()

    expect(snapshot.entries).toHaveLength(2)
    const ids = snapshot.entries.map((entry) => entry.id).sort()
    expect(ids).toEqual(['newer', 'unique'])

    const duplicate = snapshot.entries.find((entry) => entry.hash === 'duplicate-hash')
    expect(duplicate).toBeDefined()
    expect(Array.from(duplicate!.vector)).toEqual([2, 2, 2])

    flushWriteLocal()
    vi.runAllTimers()

    expect(storageMock.setItem).toHaveBeenCalledTimes(1)
    const persistedRaw = storageMock.store.get(storageKey)
    expect(persistedRaw).toBeDefined()

    const persisted = JSON.parse(persistedRaw as string) as {
      entries: Array<{ id: string; hash: string }>
    }

    expect(persisted.entries).toHaveLength(2)
    const persistedIds = persisted.entries.map((entry) => entry.id).sort()
    expect(persistedIds).toEqual(['newer', 'unique'])
    const persistedDuplicateCount = persisted.entries.filter(
      (entry) => entry.hash === 'duplicate-hash',
    ).length
    expect(persistedDuplicateCount).toBe(1)
  })
})

