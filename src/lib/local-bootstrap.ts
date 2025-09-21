import { persistenceLogger } from "./logging";

export function parseJSON<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function readLocal<T>(key: string): T | null {
  try {
    const raw =
      typeof window === "undefined" ? null : window.localStorage.getItem(key);
    return parseJSON<T>(raw);
  } catch (error) {
    persistenceLogger.warn(
      `local-bootstrap readLocal("${key}") failed; returning null.`,
      error,
    );
    return null;
  }
}

export function writeLocal(key: string, value: unknown) {
  try {
    if (typeof window === "undefined") return;
    if (value === undefined || value === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    persistenceLogger.warn(
      `local-bootstrap writeLocal("${key}") failed; ignoring value.`,
      error,
    );
  }
}

/** Inline helpers for early bootstrap scripts */
export function localBootstrapScript(): string {
  return [
    "function parseJSON(raw){if(!raw)return null;try{return JSON.parse(raw);}catch{return null;}}",
    "function readLocal(key){try{return parseJSON(localStorage.getItem(key));}catch{return null;}}",
    "function writeLocal(key,val){try{if(val==null)localStorage.removeItem(key);else localStorage.setItem(key,JSON.stringify(val));}catch{}}",
  ].join("");
}
