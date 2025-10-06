import "./check-node-version.js";
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

const uiDir = path.resolve(__dirname, "../src/components/ui");
const promptsDir = path.resolve(__dirname, "../src/components/prompts");
const appPromptsDir = path.resolve(__dirname, "../src/app/prompts");
const ignoredComponents = new Set(["Split"]);

type ProgressHandle = {
  readonly update: (value: number) => void;
  readonly stop: () => void;
};

function createProgress(total: number): ProgressHandle {
  const canRender = process.stdout.isTTY && process.stderr.isTTY;
  if (!canRender || total === 0) {
    return {
      update() {
        // no-op when TTY updates are not available
      },
      stop() {
        // no-op when no progress bar was created
      },
    } satisfies ProgressHandle;
  }

  const bars = new MultiBar(
    { clearOnComplete: false, hideCursor: true },
    Presets.shades_grey,
  );
  const bar = bars.create(total, 0);
  return {
    update(value: number) {
      bar.update(value);
    },
    stop() {
      bars.stop();
    },
  } satisfies ProgressHandle;
}

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

async function collectComponentFiles(): Promise<string[]> {
  const [uiFiles, promptFiles] = await Promise.all([
    fg("**/*.tsx", { cwd: uiDir, absolute: true }),
    fg("**/*.tsx", { cwd: promptsDir, absolute: true }),
  ]);
  return [...uiFiles, ...promptFiles].filter((file) => !shouldSkipFile(file));
}

async function collectComponentNames(): Promise<string[]> {
  const files = await collectComponentFiles();
  const names = new Set<string>();
  await Promise.all(
    files.map(async (file) => {
      const content = await fs.readFile(file, "utf8");
      const defMatch = content.match(
        /export\s+default\s+function\s+([A-Z][A-Za-z0-9_]*)/,
      );
      if (defMatch) {
        names.add(defMatch[1]);
      } else if (/export\s+default/.test(content)) {
        names.add(toComponentName(file));
      }
    }),
  );
  return [...names].filter((name) => !ignoredComponents.has(name));
}

async function loadPromptContents(): Promise<string[]> {
  const [appFiles, componentFiles] = await Promise.all([
    fg("**/*.tsx", { cwd: appPromptsDir, absolute: true }),
    fg("**/*.tsx", { cwd: promptsDir, absolute: true }),
  ]);
  const targets = [...appFiles, ...componentFiles];
  return Promise.all(targets.map((file) => fs.readFile(file, "utf8")));
}

async function verifyDemos(components: string[]): Promise<void> {
  const contents = await loadPromptContents();

  const progress = createProgress(components.length);
  const missing: string[] = [];

  components.forEach((name, index) => {
    const isReferenced = contents.some((content) => content.includes(name));
    if (!isReferenced) {
      missing.push(name);
    }
    progress.update(index + 1);
  });

  progress.stop();

  if (missing.length > 0) {
    console.error(
      [
        "Missing prompt demos for components:",
        ...missing,
        "",
        "Add demos in src/components/prompts/PromptsDemos.tsx or reference",
        "them from src/app/prompts to satisfy verification.",
        "Run `pnpm run check-prompts` to preview missing references without",
        "failing CI.",
      ].join("\n"),
    );
    process.exit(1);
  }

  console.log("All components have prompt demos.");
}

async function listUnreferencedComponents(components: string[]): Promise<void> {
  const contents = await loadPromptContents();

  const progress = createProgress(components.length);
  const missing: string[] = [];

  components.forEach((name, index) => {
    if (!contents.some((content) => content.includes(name))) {
      missing.push(name);
    }
    progress.update(index + 1);
  });

  progress.stop();

  if (missing.length > 0) {
    console.log("Unreferenced UI components:\n" + missing.join("\n"));
    return;
  }

  console.log("All UI components are referenced in prompts.");
}

export async function runPromptVerification(
  options: {
    readonly argv?: readonly string[];
  } = {},
): Promise<void> {
  const argv = options.argv ?? process.argv.slice(2);
  if (typeof process.env.PROMPT_CHECK_MODE === "string") {
    console.warn(
      "PROMPT_CHECK_MODE is no longer supported; remove the flag because the consolidated prompt verification always runs.",
    );
  }
  const args = new Set(argv);
  const shouldVerify = args.has("--verify");
  const components = await collectComponentNames();

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

async function main(): Promise<void> {
  await runPromptVerification();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
