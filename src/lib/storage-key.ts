const STORAGE_PREFIX = 'noxis-planner:'
const STORAGE_VERSION = 'v1'
const OLD_STORAGE_PREFIX = '13lr:'

const VERSIONED_STORAGE_PREFIX = `${STORAGE_PREFIX}${STORAGE_VERSION}:`
const LEGACY_VERSION_PATTERN = /^v\d+$/u

const isBrowser = typeof window !== 'undefined'

let migrated = false

function ensureMigration(): void {
  if (!isBrowser || migrated) return

  migrated = true

  try {
    const removals = new Set<string>()
    const migrations: Array<{ source: string; target: string }> = []

    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i)
      if (!key) continue

      if (key.startsWith(OLD_STORAGE_PREFIX)) {
        const suffix = key.slice(OLD_STORAGE_PREFIX.length)
        const target = `${VERSIONED_STORAGE_PREFIX}${suffix}`
        migrations.push({ source: key, target })
        removals.add(key)
        continue
      }

      if (!key.startsWith(STORAGE_PREFIX)) continue

      if (key.startsWith(VERSIONED_STORAGE_PREFIX)) continue

      const remainder = key.slice(STORAGE_PREFIX.length)
      const separatorIndex = remainder.indexOf(':')

      if (separatorIndex > -1) {
        const candidateVersion = remainder.slice(0, separatorIndex)
        if (
          candidateVersion &&
          candidateVersion !== STORAGE_VERSION &&
          LEGACY_VERSION_PATTERN.test(candidateVersion)
        ) {
          removals.add(key)
          continue
        }
      }

      const target = `${VERSIONED_STORAGE_PREFIX}${remainder}`
      migrations.push({ source: key, target })
      removals.add(key)
    }

    for (const { source, target } of migrations) {
      if (source === target) continue
      if (window.localStorage.getItem(target) !== null) continue

      const value = window.localStorage.getItem(source)
      if (value !== null) {
        window.localStorage.setItem(target, value)
      }
    }

    for (const key of removals) {
      window.localStorage.removeItem(key)
    }
  } catch {
    // ignore
  }
}

export function createStorageKey(key: string): string {
  ensureMigration()
  return `${VERSIONED_STORAGE_PREFIX}${key}`
}

export { STORAGE_PREFIX, STORAGE_VERSION, VERSIONED_STORAGE_PREFIX, OLD_STORAGE_PREFIX }
