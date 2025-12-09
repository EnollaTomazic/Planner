import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

describe("tailwind PostCSS configuration", () => {
  it("uses the @tailwindcss/postcss plugin", () => {
    const config = require("../../postcss.config.cjs");

    expect(Object.hasOwn(config, "plugins")).toBe(true);
    expect(Object.hasOwn(config.plugins, "@tailwindcss/postcss")).toBe(true);
  });

  it("uses tailwindcss 4.x with the companion PostCSS package", () => {
    const packageJsonPath = resolve(__dirname, "../../package.json");
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
    const devDependencies = packageJson.devDependencies ?? {};

    expect(devDependencies["@tailwindcss/postcss"]).toBeTypeOf("string");
    expect(devDependencies.tailwindcss).toBeTypeOf("string");
    expect(devDependencies.tailwindcss.startsWith("4.")).toBe(true);
  });
});
