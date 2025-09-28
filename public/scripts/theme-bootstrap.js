/**
 * Early theme bootstrap script.
 *
 * The logic mirrors the helpers in src/lib/theme.ts and src/lib/local-bootstrap.ts
 * but is bundled separately so it can run before hydration without using
 * dangerouslySetInnerHTML. It only reads and writes the theme key via the
 * shared persistence helpers and applies known CSS classes, so it is safe to
 * load from a static script tag.
 */
(() => {
  try {
    const BINARY_MARKER = "__planner_binary__";

    function getBuffer() {
      return typeof Buffer === "function" ? Buffer : undefined;
    }

    function bytesToBase64(bytes) {
      if (typeof btoa === "function") {
        let binary = "";
        const chunkSize = 0x8000;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.subarray(i, i + chunkSize);
          binary += String.fromCharCode(...chunk);
        }
        return btoa(binary);
      }
      const BufferCtor = getBuffer();
      if (BufferCtor) {
        return BufferCtor.from(
          bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
        ).toString("base64");
      }
      return "";
    }

    function base64ToBytes(encoded) {
      if (typeof atob === "function") {
        const binary = atob(encoded);
        const length = binary.length;
        const bytes = new Uint8Array(length);
        for (let i = 0; i < length; i += 1) {
          bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
      }
      const BufferCtor = getBuffer();
      if (BufferCtor) {
        const buffer = BufferCtor.from(encoded, "base64");
        return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      }
      return new Uint8Array();
    }

    function encodeBinary(value) {
      const view =
        value instanceof ArrayBuffer
          ? new Uint8Array(value)
          : new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
      const payload = {
        __planner_binary__: true,
        t: value instanceof ArrayBuffer ? "ArrayBuffer" : value.constructor.name,
        d: bytesToBase64(view),
      };
      if (!(value instanceof ArrayBuffer)) {
        payload.o = value.byteOffset;
        const bytesPerElement = value.BYTES_PER_ELEMENT;
        payload.l =
          typeof bytesPerElement === "number" && bytesPerElement > 0
            ? value.byteLength / bytesPerElement
            : value.byteLength;
      }
      return payload;
    }

    function decodeBinary(payload) {
      const bytes = base64ToBytes(payload.d);
      if (payload.t === "ArrayBuffer") {
        const buffer = new ArrayBuffer(bytes.byteLength);
        new Uint8Array(buffer).set(bytes);
        return buffer;
      }
      const ctor = globalThis[payload.t];
      if (typeof ctor !== "function") {
        return bytes.slice();
      }
      const byteOffset = payload.o ?? 0;
      const totalLength = byteOffset + bytes.byteLength;
      const buffer = new ArrayBuffer(totalLength);
      new Uint8Array(buffer).set(bytes, byteOffset);
      if (payload.t === "DataView") {
        return new DataView(buffer, byteOffset, payload.l);
      }
      if (payload.l !== undefined) {
        return new ctor(buffer, byteOffset, payload.l);
      }
      return new ctor(buffer, byteOffset);
    }

    function binaryReviver(_key, value) {
      if (value && typeof value === "object" && value[BINARY_MARKER]) {
        return decodeBinary(value);
      }
      return value;
    }

    function binaryReplacer(_key, value) {
      if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
        return encodeBinary(value);
      }
      return value;
    }

    function parseJSON(raw) {
      if (!raw) return null;
      try {
        return JSON.parse(raw, binaryReviver);
      } catch {
        return null;
      }
    }

    function readLocal(key) {
      try {
        return parseJSON(window.localStorage.getItem(key));
      } catch {
        return null;
      }
    }

    function writeLocal(key, value) {
      try {
        if (value === undefined || value === null) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(
            key,
            JSON.stringify(value, binaryReplacer),
          );
        }
      } catch {
        // ignore
      }
    }

    const THEME_STORAGE_KEY = "noxis-planner:ui:theme";
    const BG_CLASSES = ["", "bg-alt1", "bg-alt2", "bg-vhs", "bg-streak"];
    const BG_CLASS_SET = new Set(BG_CLASSES.filter(Boolean));

    function resetThemeClasses(classList) {
      const classesToRemove = [];
      classList.forEach((className) => {
        if (className.startsWith("theme-") || BG_CLASS_SET.has(className)) {
          classesToRemove.push(className);
        }
      });
      if (classesToRemove.length > 0) {
        classList.remove(...classesToRemove);
      }
    }

    let data = readLocal(THEME_STORAGE_KEY);
    const hasStoredTheme = Boolean(data);
    if (!data) {
      data = { variant: "lg", bg: 0 };
      writeLocal(THEME_STORAGE_KEY, data);
    }

    const cl = document.documentElement.classList;
    const dataset = document.documentElement.dataset;
    const style = document.documentElement.style;

    function resolveAssetPath(relativePath) {
      try {
        const current = document.currentScript;
        if (current && current.src) {
          return new URL(relativePath, current.src).pathname;
        }
      } catch {
        // ignore and fall through
      }
      try {
        return new URL(relativePath, window.location.href).pathname;
      } catch {
        return relativePath.startsWith("/")
          ? relativePath
          : "/" + relativePath.replace(/^\.\/+/u, "");
      }
    }

    style.setProperty(
      "--asset-noise-url",
      "url('" + resolveAssetPath("../noise.svg") + "')",
    );
    style.setProperty(
      "--asset-glitch-gif-url",
      "url('" + resolveAssetPath("../glitch-gif.gif") + "')",
    );
    resetThemeClasses(cl);
    cl.add("theme-" + data.variant);

    const isValidBgIndex =
      Number.isInteger(data.bg) &&
      data.bg >= 0 &&
      data.bg < BG_CLASSES.length;

    if (isValidBgIndex && data.bg > 0) {
      cl.add(BG_CLASSES[data.bg]);
    }

    dataset.themePref = hasStoredTheme ? "persisted" : "system";
    let prefersDark = true;
    if (!hasStoredTheme) {
      try {
        prefersDark = !!window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches;
      } catch {
        prefersDark = true;
      }
    }

    cl.toggle("dark", prefersDark);
    style.setProperty("color-scheme", prefersDark ? "dark" : "light");
  } catch {
    // Ignore errors so we never block initial paint.
  }
})();
