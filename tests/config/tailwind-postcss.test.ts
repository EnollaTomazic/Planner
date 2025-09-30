import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

describe("tailwind PostCSS configuration", () => {
  it("uses the core tailwindcss plugin and avoids @tailwindcss/postcss", () => {
    const config = require("../../postcss.config.cjs");

    expect(Object.hasOwn(config, "plugins")).toBe(true);
    expect(Object.hasOwn(config.plugins, "tailwindcss")).toBe(true);
    expect(JSON.stringify(config)).not.toContain("@tailwindcss/postcss");
  });

  it("keeps tailwindcss 3.x without the @tailwindcss/postcss package", () => {
    const packageJsonPath = resolve(__dirname, "../../package.json");
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
    const devDependencies = packageJson.devDependencies ?? {};

    expect(devDependencies["@tailwindcss/postcss"]).toBeUndefined();
    expect(devDependencies.tailwindcss).toBeTypeOf("string");
    expect(devDependencies.tailwindcss.startsWith("3.")).toBe(true);
  });
});
