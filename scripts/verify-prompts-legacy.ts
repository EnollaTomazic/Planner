import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import fg from "fast-glob";
import { MultiBar, Presets } from "cli-progress";

const toFilePath =
  typeof fileURLToPath === "function"
    ? fileURLToPath
    : (value: string | URL): string => {
        const url = value instanceof URL ? value : new URL(value);
        return decodeURIComponent(url.pathname);
      };

const __filename = toFilePath(import.meta.url);
const __dirname = path.dirname(__filename);

const promptsDir = path.resolve(__dirname, "../src/components/prompts");
const appPromptsDir = path.resolve(__dirname, "../src/app/prompts");
const promptsPageFile = path.resolve(
  __dirname,
  "../src/app/prompts/page.tsx",
);
const promptsDemosFile = path.resolve(
  __dirname,
  "../src/components/prompts/PromptsDemos.tsx",
);

type LegacyOptions = {
  readonly components: readonly string[];
  readonly shouldVerify: boolean;
};

async function loadPromptContents(): Promise<string[]> {
  const [appFiles, componentFiles] = await Promise.all([
    fg("**/*.tsx", { cwd: appPromptsDir, absolute: true }),
    fg("**/*.tsx", { cwd: promptsDir, absolute: true }),
  ]);
  const targets = [...appFiles, ...componentFiles];
  return Promise.all(targets.map((file) => fs.readFile(file, "utf8")));
}

async function verifyDemos(components: readonly string[]): Promise<void> {
  const [pageContent, demosContent] = await Promise.all([
    fs.readFile(promptsPageFile, "utf8"),
    fs.readFile(promptsDemosFile, "utf8"),
  ]);

  const bars = new MultiBar(
    { clearOnComplete: false, hideCursor: true },
    Presets.shades_grey,
  );
  const bar = bars.create(components.length, 0);
  const missing: string[] = [];

  components.forEach((name, index) => {
    if (!pageContent.includes(name) && !demosContent.includes(name)) {
      missing.push(name);
    }
    bar.update(index + 1);
  });

  bars.stop();

  if (missing.length > 0) {
    console.error("Missing prompt demos for components:\n" + missing.join("\n"));
    process.exit(1);
  }

  console.log("All components have prompt demos.");
}

async function listUnreferencedComponents(
  components: readonly string[],
): Promise<void> {
  const contents = await loadPromptContents();

  const bars = new MultiBar(
    { clearOnComplete: false, hideCursor: true },
    Presets.shades_grey,
  );
  const bar = bars.create(components.length, 0);
  const missing: string[] = [];

  components.forEach((name, index) => {
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

export async function runLegacyPromptVerification(
  options: LegacyOptions,
): Promise<void> {
  const { components, shouldVerify } = options;

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
