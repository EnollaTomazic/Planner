import { afterEach, describe, expect, it, vi } from "vitest";

import {
  localBootstrapScript,
  parseJSON,
  readLocal,
  writeLocal,
} from "../../src/lib/local-bootstrap";
import { persistenceLogger } from "../../src/lib/logging";

describe("local bootstrap helpers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("parseJSON", () => {
    it("returns parsed JSON when provided a valid payload", () => {
      const payload = { theme: "dark" };

      expect(parseJSON<typeof payload>(JSON.stringify(payload))).toEqual(payload);
    });

    it("returns null for nullish inputs", () => {
      expect(parseJSON(null)).toBeNull();
    });

    it("returns null when JSON parsing fails", () => {
      expect(parseJSON("{invalid-json")).toBeNull();
    });
  });

  describe("readLocal", () => {
    it("returns parsed values from storage", () => {
      const stored = { density: "compact" };
      const getItem = vi
        .spyOn(Storage.prototype, "getItem")
        .mockReturnValue(JSON.stringify(stored));
      const warn = vi.spyOn(persistenceLogger, "warn").mockImplementation(() => {});

      expect(readLocal<typeof stored>("planner-preferences")).toEqual(stored);
      expect(getItem).toHaveBeenCalledWith("planner-preferences");
      expect(warn).not.toHaveBeenCalled();
    });

    it("returns null and logs when storage access fails", () => {
      const error = new Error("storage failed");
      const getItem = vi
        .spyOn(Storage.prototype, "getItem")
        .mockImplementation(() => {
          throw error;
        });
      const warn = vi.spyOn(persistenceLogger, "warn").mockImplementation(() => {});

      expect(readLocal("planner-preferences")).toBeNull();
      expect(getItem).toHaveBeenCalledWith("planner-preferences");
      expect(warn).toHaveBeenCalledWith(
        'local-bootstrap readLocal("planner-preferences") failed; returning null.',
        error,
      );
    });
  });

  describe("writeLocal", () => {
    it("serializes values into storage", () => {
      const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {});
      const removeItem = vi
        .spyOn(Storage.prototype, "removeItem")
        .mockImplementation(() => {});

      const value = { mode: "timeline" };
      writeLocal("planner-preferences", value);

      expect(setItem).toHaveBeenCalledWith(
        "planner-preferences",
        JSON.stringify(value),
      );
      expect(removeItem).not.toHaveBeenCalled();
    });

    it("removes keys when provided nullish values", () => {
      const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {});
      const removeItem = vi
        .spyOn(Storage.prototype, "removeItem")
        .mockImplementation(() => {});

      writeLocal("planner-preferences", null);
      writeLocal("planner-preferences", undefined);

      expect(removeItem).toHaveBeenCalledTimes(2);
      expect(removeItem).toHaveBeenNthCalledWith(1, "planner-preferences");
      expect(removeItem).toHaveBeenNthCalledWith(2, "planner-preferences");
      expect(setItem).not.toHaveBeenCalled();
    });

    it("logs when storage writes fail", () => {
      const error = new Error("storage failed");
      const setItem = vi
        .spyOn(Storage.prototype, "setItem")
        .mockImplementation(() => {
          throw error;
        });
      const warn = vi.spyOn(persistenceLogger, "warn").mockImplementation(() => {});

      writeLocal("planner-preferences", { mode: "timeline" });

      expect(setItem).toHaveBeenCalledWith(
        "planner-preferences",
        JSON.stringify({ mode: "timeline" }),
      );
      expect(warn).toHaveBeenCalledWith(
        'local-bootstrap writeLocal("planner-preferences") failed; ignoring value.',
        error,
      );
    });

    it("round-trips typed arrays through storage", () => {
      const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {});
      const removeItem = vi
        .spyOn(Storage.prototype, "removeItem")
        .mockImplementation(() => {});

      const key = "planner-binary";
      const bytes = new Uint8Array([0, 127, 255]);

      writeLocal(key, bytes);

      expect(setItem).toHaveBeenCalledTimes(1);
      const storedValue = setItem.mock.calls[0]?.[1];
      expect(typeof storedValue).toBe("string");
      expect(storedValue).toContain("__planner_binary__");
      expect(removeItem).not.toHaveBeenCalled();

      vi.spyOn(Storage.prototype, "getItem").mockReturnValue(storedValue as string);

      const roundTripped = readLocal<Uint8Array>(key);
      expect(roundTripped).toBeInstanceOf(Uint8Array);
      expect(Array.from(roundTripped ?? [])).toEqual([0, 127, 255]);
    });
  });

  it("matches the inline bootstrap helper implementation", () => {
    expect(localBootstrapScript()).toMatchInlineSnapshot(
      `"const a='__planner_binary__';function e(r){if(!r)return null;try{return JSON.parse(r,n);}catch{return null;}}function t(r){try{return e(localStorage.getItem(r));}catch{return null;}}function o(r){try{if(r==null)localStorage.removeItem(r);else localStorage.setItem(r,JSON.stringify(r,i));}catch{}}function n(r,l){if(l&&typeof l==='object'&&l[a])return s(l);return l;}function i(r,l){if(l instanceof ArrayBuffer||ArrayBuffer.isView(l))return c(l);return l;}function f(r){if(typeof btoa==='function'){let l='',u=0x8000;for(let e=0;e<r.length;e+=u){const t=r.subarray(e,e+u);l+=String.fromCharCode(...t);}return btoa(l);}if(typeof Buffer!=='undefined')return Buffer.from(r.buffer,r.byteOffset,r.byteLength).toString('base64');return'';}function y(r){if(typeof atob==='function'){const l=atob(r),u=l.length,t=new Uint8Array(u);for(let e=0;e<u;e+=1)t[e]=l.charCodeAt(e);return t;}if(typeof Buffer!=='undefined'){const l=Buffer.from(r,'base64');return new Uint8Array(l.buffer,l.byteOffset,l.byteLength);}return new Uint8Array;}function c(r){const l=r instanceof ArrayBuffer?new Uint8Array(r):new Uint8Array(r.buffer,r.byteOffset,r.byteLength),u=r instanceof ArrayBuffer?'ArrayBuffer':r.constructor.name,t={__planner_binary__:!0,t:u,d:f(l)};if(!(r instanceof ArrayBuffer)){t.o=r.byteOffset,t.l='BYTES_PER_ELEMENT'in r&&typeof r.BYTES_PER_ELEMENT==='number'?r.byteLength/r.BYTES_PER_ELEMENT:r.byteLength;}return t;}function s(r){const l=y(r.d);if(r.t==='ArrayBuffer'){const e=new ArrayBuffer(l.byteLength);return new Uint8Array(e).set(l),e;}const u=globalThis[r.t];if(typeof u!=='function')return l.slice();const o=r.o??0,c=o+l.byteLength,f=new ArrayBuffer(c);new Uint8Array(f).set(l,o);if(r.t==='DataView')return new DataView(f,o,r.l);if(r.l!==undefined)return new u(f,o,r.l);return new u(f,o);}function parseJSON(raw){return e(raw);}function readLocal(key){return t(key);}function writeLocal(key,val){return o(key,val);}"`,
    );
  });
});
