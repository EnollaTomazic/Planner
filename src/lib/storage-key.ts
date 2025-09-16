const STORAGE_PREFIX = "noxis-planner:";
const OLD_STORAGE_PREFIX = "13lr:";

const isBrowser = typeof window !== "undefined";

let migrated = false;

function ensureMigration() {
  if (!isBrowser || migrated) return;
  try {
    const legacyKeys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key?.startsWith(OLD_STORAGE_PREFIX)) legacyKeys.push(key);
    }
    for (const oldKey of legacyKeys) {
      const newKey = `${STORAGE_PREFIX}${oldKey.slice(OLD_STORAGE_PREFIX.length)}`;
      if (window.localStorage.getItem(newKey) === null) {
        const value = window.localStorage.getItem(oldKey);
        if (value !== null) window.localStorage.setItem(newKey, value);
      }
      window.localStorage.removeItem(oldKey);
    }
  } catch {
    // ignore
  }
  migrated = true;
}

export function createStorageKey(key: string): string {
  ensureMigration();
  return `${STORAGE_PREFIX}${key}`;
}

export { STORAGE_PREFIX, OLD_STORAGE_PREFIX };
