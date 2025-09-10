import StyleDictionary from "style-dictionary";
import type {
  FormatFnArguments,
  TransformedToken,
} from "style-dictionary/types";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spacingTokens, radiusTokens } from "../src/lib/tokens.ts";
import { createTaskBar, stopBars } from "../src/utils/progress.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

StyleDictionary.registerFormat({
  name: "tokens/markdown",
  format: ({ dictionary }: FormatFnArguments): string => {
    const lines = dictionary.allTokens.map(
      (t: TransformedToken) => `| ${t.name} | ${t.value} |`,
    );
    return ["| Token | Value |", "| --- | --- |", ...lines].join("\n");
  },
});

async function loadRadiusValues(): Promise<Record<string, string>> {
  const themePath = path.resolve(__dirname, "../src/app/themes.css");
  const css = await fs.readFile(themePath, "utf8");
  const values: Record<string, string> = {};
  for (const token of radiusTokens) {
    const regex = new RegExp(`${token}:\\s*([^;]+);`);
    const match = css.match(regex);
    if (match) {
      values[token] = match[1].trim();
    }
  }
  return values;
}

async function buildTokens(): Promise<void> {
  const radiusValues = await loadRadiusValues();
  const spacing = spacingTokens.reduce<Record<string, { value: string }>>(
    (acc, val, idx) => {
      acc[idx + 1] = { value: `${val}px` };
      return acc;
    },
    {},
  );
  const radius = Object.entries(radiusValues).reduce<
    Record<string, { value: string }>
  >((acc, [name, value]) => {
    const key = name.replace("--radius-", "");
    acc[key] = { value };
    return acc;
  }, {});

  const themePath = path.resolve(__dirname, "../src/app/themes.css");
  const css = await fs.readFile(themePath, "utf8");
  const rootMatch = css.match(/:root\s*{([^}]*)}/);
  const baseCss = rootMatch ? rootMatch[1] : css;
  const colorRegex = /--([a-zA-Z0-9-]+):\s*([^;]+);/g;
  const colors: Record<string, { value: string }> = {};
  let match: RegExpExecArray | null;
  while ((match = colorRegex.exec(baseCss))) {
    const name = match[1];
    if (name.startsWith("radius-")) continue;
    colors[name] = { value: match[2].trim() };
  }

  const sd = new StyleDictionary({
    tokens: { ...colors, spacing, radius },
    platforms: {
      css: {
        transforms: ["name/kebab"],
        buildPath: "tokens/",
        files: [{ destination: "tokens.css", format: "css/variables" }],
      },
      js: {
        transforms: ["name/camel"],
        buildPath: "tokens/",
        files: [{ destination: "tokens.js", format: "javascript/es6" }],
      },
      docs: {
        transforms: ["name/kebab"],
        buildPath: "docs/",
        files: [{ destination: "tokens.md", format: "tokens/markdown" }],
      },
    },
  });

  const bar = createTaskBar(3);
  sd.buildPlatform("css");
  bar.update(1);
  sd.buildPlatform("js");
  bar.update(2);
  sd.buildPlatform("docs");
  bar.update(3);
  stopBars();
}

buildTokens();
