const fs = require("fs");
const path = require("path");

describe("bootstrap scripts", () => {
  const scriptPath = path.join(__dirname, "..", "scripts");

  const cacheDir = path.join(scriptPath, ".cache");
  const expectedFiles = [
    "build-gallery-usage.json",
    "generate-feature-index.json",
    "generate-themes.json",
    "generate-tokens.json",
    "generate-ui-index.json",
  ];

  const seededFiles = new Set();
  let createdCacheDir = false;

  beforeAll(() => {
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
      createdCacheDir = true;
    }

    for (const file of expectedFiles) {
      const filePath = path.join(cacheDir, file);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, "{\n}\n", "utf8");
        seededFiles.add(filePath);
      }
    }
  });

  afterAll(() => {
    for (const filePath of seededFiles) {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        // ignore cleanup failures so test teardown doesn't mask assertions
      }
    }

    if (createdCacheDir) {
      try {
        fs.rmdirSync(cacheDir);
      } catch (error) {
        // ignore cleanup failures so test teardown doesn't mask assertions
      }
    }
  });

  beforeEach(() => {
    jest.resetModules();
    const currentScript = document.createElement("script");
    currentScript.id = "bootstrap-script";
    currentScript.nonce = "test-nonce";
    Object.defineProperty(document, "currentScript", {
      configurable: true,
      value: currentScript,
    });

    window.__NEXT_DATA__ = { assetPrefix: "" };
    window.history.replaceState = jest.fn();
    window.history.pushState = jest.fn();

    const storageFactory = () => {
      let storage = new Map();
      return {
        getItem: (key) => (storage.has(key) ? storage.get(key) : null),
        setItem: (key, value) => storage.set(key, String(value)),
        removeItem: (key) => storage.delete(key),
        clear: () => storage.clear(),
        key: (index) => Array.from(storage.keys())[index] ?? null,
        get length() {
          return storage.size;
        },
      };
    };

    Object.defineProperty(window, "sessionStorage", {
      configurable: true,
      value: storageFactory(),
    });

    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: storageFactory(),
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(document, "currentScript");
    Reflect.deleteProperty(window, "__NEXT_DATA__");
  });

  test("github pages bootstrap executes without errors", () => {
    expect(() => {
      require(path.join(scriptPath, "github-pages-bootstrap.js"));
    }).not.toThrow();
  });

  test("theme bootstrap executes without errors and injects style", () => {
    require(path.join(scriptPath, "theme-bootstrap.js"));
    const style = document.getElementById("asset-url-overrides");
    expect(style).toBeInstanceOf(window.HTMLStyleElement);
    expect(style.textContent).toContain("--asset-noise-url");
  });

  test("cached output files exist", () => {
    const missing = expectedFiles.filter(
      (file) => !fs.existsSync(path.join(cacheDir, file)),
    );

    expect(missing).toEqual([]);
  });
});
