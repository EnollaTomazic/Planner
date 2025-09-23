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
    function parseJSON(raw) {
      if (!raw) return null;
      try {
        return JSON.parse(raw);
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
          window.localStorage.setItem(key, JSON.stringify(value));
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
