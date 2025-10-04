/**
 * GitHub Pages deep-link restoration bootstrap.
 * Mirrors the helper logic in src/lib/github-pages.ts.
 */
(() => {
  try {
    var storagePlaceholder = "__GITHUB_PAGES_REDIRECT_STORAGE_KEY__";
    var defaultStorageKey = "noxis-planner:gh-pages:redirect";
    var storageKey = storagePlaceholder;
    if (!storageKey || storageKey === "__GITHUB_PAGES_REDIRECT_STORAGE_KEY__") {
      storageKey = defaultStorageKey;
    } else {
      storageKey = storageKey.trim() || defaultStorageKey;
    }

    var basePlaceholder = "__BASE_PATH__";
    var rawBasePath = basePlaceholder;
    if (!rawBasePath || rawBasePath === "__BASE_PATH__") {
      rawBasePath = "";
    } else {
      rawBasePath = rawBasePath.trim();
    }

    var ABSOLUTE_URL_PATTERN = /^[a-zA-Z][a-zA-Z\d+.-]*:/;

    function normalizeBasePath(value) {
      if (!value || value === "/") {
        return "";
      }
      var segments = value
        .split("/")
        .map(function (segment) {
          return segment.trim();
        })
        .filter(function (segment) {
          return segment.length > 0;
        });
      if (segments.length === 0) {
        return "";
      }
      return "/" + segments.join("/");
    }

    var basePath = normalizeBasePath(rawBasePath);

    var storedValue = null;
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        storedValue = window.sessionStorage.getItem(storageKey);
      }
    } catch (error) {
      storedValue = null;
    }

    if (!storedValue) {
      return;
    }

    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        window.sessionStorage.removeItem(storageKey);
      }
    } catch (error) {
      // Ignore cleanup failures.
    }

    var sanitized = storedValue.trim();
    if (!sanitized) {
      return;
    }

    if (ABSOLUTE_URL_PATTERN.test(sanitized) || sanitized.indexOf("//") === 0) {
      return;
    }

    var target = sanitized;
    if (!target.startsWith("/")) {
      target = "/" + target;
    }

    if (basePath && !target.startsWith(basePath)) {
      var suffix = target.startsWith("/") ? target : "/" + target;
      target = basePath + suffix;
    }

    var currentPath =
      (window.location.pathname || "") +
      (window.location.search || "") +
      (window.location.hash || "");

    if (target === currentPath) {
      return;
    }

    var normalizedRoot = basePath || "/";
    var indexPath = normalizedRoot.replace(/\/$/, "") + "/index.html";
    if (currentPath !== normalizedRoot && currentPath !== indexPath) {
      return;
    }

    if (
      typeof window.history === "object" &&
      typeof window.history.replaceState === "function"
    ) {
      window.history.replaceState(null, "", target);
    } else {
      window.location.replace(target);
    }
  } catch (error) {
    // Swallow bootstrap failures. The SPA can still hydrate from /index.html.
  }
})();
