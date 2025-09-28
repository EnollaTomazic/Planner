"use client";

import { persistenceLogger } from "./logging";

type BinaryPayload = {
  __planner_binary__: true;
  t: string;
  d: string;
  o?: number;
  l?: number;
};

const binaryMarker = "__planner_binary__";

function getTypedArrayConstructor(type: string):
  | (new (buffer: ArrayBuffer, byteOffset?: number, length?: number) => ArrayBufferView)
  | null {
  const ctor = (globalThis as Record<string, unknown>)[type];
  if (typeof ctor === "function") {
    return ctor as new (
      buffer: ArrayBuffer,
      byteOffset?: number,
      length?: number,
    ) => ArrayBufferView;
  }
  return null;
}

type BufferLike = {
  from(
    input: ArrayBufferLike | string,
    encoding?: string,
  ): {
    buffer: ArrayBuffer;
    byteOffset: number;
    byteLength: number;
    toString(encoding: string): string;
  };
};

function getBuffer(): BufferLike | null {
  const bufferCtor = (globalThis as { Buffer?: BufferLike }).Buffer;
  return bufferCtor ?? null;
}

function bytesToBase64(bytes: Uint8Array): string {
  if (typeof btoa === "function") {
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    return btoa(binary);
  }
  const bufferCtor = getBuffer();
  if (bufferCtor) {
    return bufferCtor
      .from(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength))
      .toString("base64");
  }
  return "";
}

function base64ToBytes(encoded: string): Uint8Array {
  if (typeof atob === "function") {
    const binary = atob(encoded);
    const length = binary.length;
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
  const bufferCtor = getBuffer();
  if (bufferCtor) {
    const buffer = bufferCtor.from(encoded, "base64");
    return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  }
  return new Uint8Array();
}

function encodeBinary(value: ArrayBuffer | ArrayBufferView): BinaryPayload {
  const view =
    value instanceof ArrayBuffer
      ? new Uint8Array(value)
      : new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  const type = value instanceof ArrayBuffer ? "ArrayBuffer" : value.constructor.name;
  const payload: BinaryPayload = {
    __planner_binary__: true,
    t: type,
    d: bytesToBase64(view),
  };
  if (!(value instanceof ArrayBuffer)) {
    payload.o = value.byteOffset;
    payload.l =
      "BYTES_PER_ELEMENT" in value && typeof value.BYTES_PER_ELEMENT === "number"
        ? value.byteLength / value.BYTES_PER_ELEMENT
        : value.byteLength;
  }
  return payload;
}

function decodeBinary(payload: BinaryPayload): ArrayBuffer | ArrayBufferView {
  const bytes = base64ToBytes(payload.d);
  if (payload.t === "ArrayBuffer") {
    const buffer = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(buffer).set(bytes);
    return buffer;
  }
  const ctor = getTypedArrayConstructor(payload.t);
  if (!ctor) {
    return bytes.slice();
  }
  if (payload.t === "DataView") {
    const byteOffset = payload.o ?? 0;
    const totalLength = byteOffset + bytes.byteLength;
    const buffer = new ArrayBuffer(totalLength);
    new Uint8Array(buffer).set(bytes, byteOffset);
    return new DataView(buffer, byteOffset, payload.l);
  }
  const byteOffset = payload.o ?? 0;
  const totalLength = byteOffset + bytes.byteLength;
  const buffer = new ArrayBuffer(totalLength);
  new Uint8Array(buffer).set(bytes, byteOffset);
  if (payload.l !== undefined) {
    return new ctor(buffer, byteOffset, payload.l);
  }
  return new ctor(buffer, byteOffset);
}

function binaryReplacer(_key: string, value: unknown): unknown {
  if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
    return encodeBinary(value);
  }
  return value;
}

function binaryReviver(_key: string, value: unknown): unknown {
  if (
    value &&
    typeof value === "object" &&
    binaryMarker in value &&
    (value as BinaryPayload).__planner_binary__
  ) {
    return decodeBinary(value as BinaryPayload);
  }
  return value;
}

export function stringifyWithBinary(value: unknown): string {
  const serialized = JSON.stringify(value, binaryReplacer);
  if (typeof serialized !== "string") {
    throw new Error("Unable to serialize value");
  }
  return serialized;
}

export function parseJSON<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw, binaryReviver) as T;
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
      window.localStorage.setItem(key, stringifyWithBinary(value));
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
    "const a='__planner_binary__';",
    "function e(r){if(!r)return null;try{return JSON.parse(r,n);}catch{return null;}}",
    "function t(r){try{return e(localStorage.getItem(r));}catch{return null;}}",
    "function o(r){try{if(r==null)localStorage.removeItem(r);else localStorage.setItem(r,JSON.stringify(r,i));}catch{}}",
    "function n(r,l){if(l&&typeof l==='object'&&l[a])return s(l);return l;}",
    "function i(r,l){if(l instanceof ArrayBuffer||ArrayBuffer.isView(l))return c(l);return l;}",
    "function f(r){if(typeof btoa==='function'){let l='',u=0x8000;for(let e=0;e<r.length;e+=u){const t=r.subarray(e,e+u);l+=String.fromCharCode(...t);}return btoa(l);}if(typeof Buffer!=='undefined')return Buffer.from(r.buffer,r.byteOffset,r.byteLength).toString('base64');return'';}",
    "function y(r){if(typeof atob==='function'){const l=atob(r),u=l.length,t=new Uint8Array(u);for(let e=0;e<u;e+=1)t[e]=l.charCodeAt(e);return t;}if(typeof Buffer!=='undefined'){const l=Buffer.from(r,'base64');return new Uint8Array(l.buffer,l.byteOffset,l.byteLength);}return new Uint8Array;}",
    "function c(r){const l=r instanceof ArrayBuffer?new Uint8Array(r):new Uint8Array(r.buffer,r.byteOffset,r.byteLength),u=r instanceof ArrayBuffer?'ArrayBuffer':r.constructor.name,t={__planner_binary__:!0,t:u,d:f(l)};if(!(r instanceof ArrayBuffer)){t.o=r.byteOffset,t.l='BYTES_PER_ELEMENT'in r&&typeof r.BYTES_PER_ELEMENT==='number'?r.byteLength/r.BYTES_PER_ELEMENT:r.byteLength;}return t;}",
    "function s(r){const l=y(r.d);if(r.t==='ArrayBuffer'){const e=new ArrayBuffer(l.byteLength);return new Uint8Array(e).set(l),e;}const u=globalThis[r.t];if(typeof u!=='function')return l.slice();const o=r.o??0,c=o+l.byteLength,f=new ArrayBuffer(c);new Uint8Array(f).set(l,o);if(r.t==='DataView')return new DataView(f,o,r.l);if(r.l!==undefined)return new u(f,o,r.l);return new u(f,o);}",
    "function parseJSON(raw){return e(raw);}function readLocal(key){return t(key);}function writeLocal(key,val){return o(key,val);}",
  ].join("");
}
