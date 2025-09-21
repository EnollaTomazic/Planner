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
  });

  it("matches the inline bootstrap helper implementation", () => {
    expect(localBootstrapScript()).toMatchInlineSnapshot(
      `"function parseJSON(raw){if(!raw)return null;try{return JSON.parse(raw);}catch{return null;}}function readLocal(key){try{return parseJSON(localStorage.getItem(key));}catch{return null;}}function writeLocal(key,val){try{if(val==null)localStorage.removeItem(key);else localStorage.setItem(key,JSON.stringify(val));}catch{}}"`,
    );
  });
});
