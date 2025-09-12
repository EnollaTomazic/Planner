import "./check-node-version.js";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { MultiBar, Presets } from "cli-progress";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uiDir = path.resolve(__dirname, "../src/components/ui");
const promptsDir = path.resolve(__dirname, "../src/components/prompts");
const pageFile = path.resolve(__dirname, "../src/app/prompts/page.tsx");
const demosFile = path.resolve(
  __dirname,
  "../src/components/prompts/PromptsDemos.tsx",
);

const ignore = new Set(["Split"]);

function toComponentName(file: string): string {
  const base = path.basename(file).replace(/\.(tsx|ts)$/, "");
  return base
    .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (c) => c.toUpperCase());
}

async function getTsxFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getTsxFiles(full)));
    } else if (entry.isFile() && entry.name.endsWith(".tsx")) {
      const base = path.basename(entry.name, ".tsx");
      if (base === "index" || base.endsWith("Page")) {
        continue;
      }
      files.push(full);
    }
  }
  return files;
}

async function collectComponents(): Promise<string[]> {
  const files = [
    ...(await getTsxFiles(uiDir)),
    ...(await getTsxFiles(promptsDir)),
  ];
  const names = new Set<string>();
  for (const file of files) {
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

async function main() {
  const components = await collectComponents();
  const bars = new MultiBar(
    { clearOnComplete: false, hideCursor: true },
    Presets.shades_grey,
  );
  const bar = bars.create(components.length, 0);
  const page = await fs.readFile(pageFile, "utf8");
  const demos = await fs.readFile(demosFile, "utf8");
  const missing: string[] = [];
  components.forEach((name, idx) => {
    if (!page.includes(name) && !demos.includes(name)) {
      missing.push(name);
    }
    bar.update(idx + 1);
  });
  bars.stop();
  if (missing.length) {
    console.error(
      "Missing prompt demos for components:\n" + missing.join("\n"),
    );
    process.exit(1);
  }
  console.log("All components have prompt demos.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
