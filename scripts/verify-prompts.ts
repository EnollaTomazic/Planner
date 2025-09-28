import "./check-node-version.js";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import fg from "fast-glob";
import { MultiBar, Presets } from "cli-progress";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uiDir = path.resolve(__dirname, "../src/components/ui");
const promptsDir = path.resolve(__dirname, "../src/components/prompts");
const appPromptsDir = path.resolve(__dirname, "../src/app/prompts");
const ignoredComponents = new Set(["Split"]);

function toComponentName(file: string): string {
  const base = path.basename(file).replace(/\.(tsx|ts)$/, "");
  return base
    .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (c) => c.toUpperCase());
}

function shouldSkipFile(file: string): boolean {
  const base = path.basename(file);
  return (
    base === "index.ts" ||
    base === "index.tsx" ||
    base.endsWith("Page.tsx") ||
    base.includes(".gallery.") ||
    base.includes(".meta.")
  );
}

type ComponentSource = "ui" | "prompts";

interface ComponentInfo {
  name: string;
  source: ComponentSource;
}

async function collectComponentInfos(): Promise<ComponentInfo[]> {
  const [uiFiles, promptFiles] = await Promise.all([
    fg("**/*.tsx", { cwd: uiDir, absolute: true }),
    fg("**/*.tsx", { cwd: promptsDir, absolute: true }),
  ]);

  async function readName(file: string): Promise<string | null> {
    const content = await fs.readFile(file, "utf8");
    const defMatch = content.match(
      /export\s+default\s+function\s+([A-Z][A-Za-z0-9_]*)/,
    );
    if (defMatch) {
      return defMatch[1];
    }
    if (/export\s+default/.test(content)) {
      return toComponentName(file);
    }
    return null;
  }

  const entries = new Map<string, ComponentInfo>();

  await Promise.all(
    uiFiles
      .filter((file) => !shouldSkipFile(file))
      .map(async (file) => {
        const name = await readName(file);
        if (!name || ignoredComponents.has(name)) {
          return;
        }
        entries.set(name, { name, source: "ui" });
      }),
  );

  await Promise.all(
    promptFiles
      .filter((file) => !shouldSkipFile(file))
      .map(async (file) => {
        const name = await readName(file);
        if (!name || ignoredComponents.has(name) || entries.has(name)) {
          return;
        }
        entries.set(name, { name, source: "prompts" });
      }),
  );

  return [...entries.values()];
}

async function loadPromptContents(): Promise<string[]> {
  const [appFiles, componentFiles] = await Promise.all([
    fg("**/*.tsx", { cwd: appPromptsDir, absolute: true }),
    fg("**/*.tsx", { cwd: promptsDir, absolute: true }),
  ]);
  const targets = [...appFiles, ...componentFiles];
  return Promise.all(targets.map((file) => fs.readFile(file, "utf8")));
}

async function verifyDemos(components: ComponentInfo[]): Promise<void> {
  const referenceContents = await loadPromptContents();
  const bars = new MultiBar(
    { clearOnComplete: false, hideCursor: true },
    Presets.shades_grey,
  );
  const uiComponents = components.filter(
    (component) => component.source === "ui",
  );
  const bar = bars.create(uiComponents.length, 0);
  const missing: string[] = [];

  uiComponents.forEach(({ name }, index) => {
    const isReferenced = referenceContents.some((content) =>
      content.includes(name),
    );

    if (!isReferenced) {
      missing.push(name);
    }
    bar.update(index + 1);
  });

  bars.stop();

  if (missing.length > 0) {
    console.error(
      "Missing prompt demos for components:\n" + missing.join("\n"),
    );
    process.exit(1);
  }

  console.log("All components have prompt demos.");
}

async function listUnreferencedComponents(
  components: ComponentInfo[],
): Promise<void> {
  const contents = await loadPromptContents();

  const bars = new MultiBar(
    { clearOnComplete: false, hideCursor: true },
    Presets.shades_grey,
  );
  const uiComponents = components.filter(
    (component) => component.source === "ui",
  );
  const bar = bars.create(uiComponents.length, 0);
  const missing: string[] = [];

  uiComponents.forEach(({ name }, index) => {
    if (!contents.some((content) => content.includes(name))) {
      missing.push(name);
    }
    bar.update(index + 1);
  });

  bars.stop();

  if (missing.length > 0) {
    console.log("Unreferenced UI components:\n" + missing.join("\n"));
    return;
  }

  console.log("All UI components are referenced in prompts.");
}

async function main(): Promise<void> {
  const args = new Set(process.argv.slice(2));
  const shouldVerify = args.has("--verify");
  const components = await collectComponentInfos();

  if (components.length === 0) {
    console.log("No UI components found to verify.");
    return;
  }

  if (shouldVerify) {
    await verifyDemos(components);
    return;
  }

  await listUnreferencedComponents(components);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
