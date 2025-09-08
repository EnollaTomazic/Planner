import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import fg from "fast-glob";
import { MultiBar, Presets } from "cli-progress";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uiDir = path.resolve(__dirname, "../src/components/ui");
const promptsDir = path.resolve(__dirname, "../src/components/prompts");
const pageFile = path.resolve(__dirname, "../src/app/prompts/page.tsx");

const ignore = new Set(["Split"]);

function toComponentName(file: string): string {
  const base = path.basename(file).replace(/\.(tsx|ts)$/, "");
  return base
    .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (c) => c.toUpperCase());
}

async function getUiComponents(): Promise<string[]> {
  const files = await fg("**/*.tsx", { cwd: uiDir, absolute: true });
  const names = new Set<string>();
  for (const file of files) {
    const base = path.basename(file);
    if (base === "index.ts" || base === "index.tsx" || base.endsWith("Page.tsx")) {
      continue;
    }
    const content = await fs.readFile(file, "utf8");
    const defMatch = content.match(
      /export\s+default\s+function\s+([A-Z][A-Za-z0-9_]*)/,
    );
    if (defMatch) {
      names.add(defMatch[1]);
    } else if (/export\s+default/.test(content)) {
      names.add(toComponentName(file));
    }
  }
  return [...names].filter((n) => !ignore.has(n));
}

async function getPromptContents(): Promise<string[]> {
  const files = await fg(["**/*.tsx"], {
    cwd: promptsDir,
    absolute: true,
  });
  const targets = [pageFile, ...files];
  return Promise.all(targets.map((f) => fs.readFile(f, "utf8")));
}

async function main() {
  const components = await getUiComponents();
  const contents = await getPromptContents();
  const bars = new MultiBar(
    { clearOnComplete: false, hideCursor: true },
    Presets.shades_grey,
  );
  const bar = bars.create(components.length, 0);
  const missing: string[] = [];
  components.forEach((name, idx) => {
    if (!contents.some((c) => c.includes(name))) {
      missing.push(name);
    }
    bar.update(idx + 1);
  });
  bars.stop();
  if (missing.length) {
    console.error(
      "Unreferenced UI components:\n" + missing.join("\n"),
    );
    process.exit(1);
  }
  console.log("All UI components referenced in prompts page.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
