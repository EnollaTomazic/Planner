import "./check-node-version.js";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import fg from "fast-glob";
import ts from "typescript";
import type {
  GallerySerializableEntry,
  GallerySerializableSection,
} from "../src/components/gallery/registry";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const appDir = path.join(rootDir, "src/app");
const cacheDir = path.join(__dirname, ".cache");
const manifestFile = path.join(cacheDir, "build-gallery-usage.json");
const usageFile = path.join(rootDir, "src/components/gallery/usage.json");
const tsconfigPath = path.join(rootDir, "tsconfig.json");

const TRACKED_PATTERNS = [
  "src/app/**/*.{ts,tsx}",
  "src/components/**/*.gallery.{ts,tsx}",
];

const PAGE_GLOB = "**/page.{ts,tsx}";
const ROUTE_FILE_GLOB = "**/*.{ts,tsx}";

interface ManifestEntry {
  readonly mtimeMs: number;
}

type Manifest = Record<string, ManifestEntry>;

interface ImportSymbol {
  readonly name: string;
  readonly specifier: string;
}

const compilerOptions = (() => {
  const config = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  if (config.error) {
    throw new Error(`Failed to read tsconfig: ${config.error.messageText}`);
  }
  const parsed = ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    rootDir,
  );
  return parsed.options;
})();

async function ensureCacheDir(): Promise<void> {
  await fs.mkdir(cacheDir, { recursive: true });
}

async function writeManifest(files: readonly string[]): Promise<void> {
  const entries: Manifest = {};
  for (const file of files) {
    const stat = await fs.stat(file);
    const rel = path.relative(rootDir, file).replace(/\\/g, "/");
    entries[rel] = { mtimeMs: stat.mtimeMs } satisfies ManifestEntry;
  }
  await ensureCacheDir();
  await fs.writeFile(manifestFile, JSON.stringify(entries, null, 2));
}

function getScriptKind(file: string): ts.ScriptKind {
  if (file.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (file.endsWith(".ts")) return ts.ScriptKind.TS;
  if (file.endsWith(".jsx")) return ts.ScriptKind.JSX;
  if (file.endsWith(".js")) return ts.ScriptKind.JS;
  return ts.ScriptKind.TSX;
}

function formatRoute(routeDir: string): string {
  const relative = path.relative(appDir, routeDir).replace(/\\/g, "/");
  if (!relative || relative === ".") {
    return "/";
  }
  const segments = relative
    .split("/")
    .filter(Boolean)
    .filter((segment) => !/^\(.*\)$/.test(segment))
    .map((segment) => segment.replace(/^\((.*)\)$/u, "$1"));
  if (segments.length === 0) {
    return "/";
  }
  return `/${segments.join("/")}`;
}

function collectImportsFromSource(source: ts.SourceFile): ImportSymbol[] {
  const symbols: ImportSymbol[] = [];

  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) && node.importClause) {
      const { importClause } = node;
      if (importClause.isTypeOnly) {
        return;
      }
      if (!ts.isStringLiteral(node.moduleSpecifier)) {
        return;
      }
      const specifier = node.moduleSpecifier.text;
      if (importClause.name) {
        symbols.push({ name: importClause.name.text, specifier });
      }
      if (importClause.namedBindings) {
        if (ts.isNamedImports(importClause.namedBindings)) {
          for (const element of importClause.namedBindings.elements) {
            if (element.isTypeOnly) {
              continue;
            }
            const imported = element.propertyName ?? element.name;
            symbols.push({ name: imported.text, specifier });
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };

  ts.forEachChild(source, visit);
  return symbols;
}

async function collectRouteImports(routeDir: string): Promise<Set<string>> {
  const files = await fg(ROUTE_FILE_GLOB, {
    cwd: routeDir,
    absolute: true,
  });
  const imports = new Set<string>();
  for (const file of files) {
    const content = await fs.readFile(file, "utf8");
    const source = ts.createSourceFile(
      pathToFileURL(file).href,
      content,
      ts.ScriptTarget.Latest,
      true,
      getScriptKind(file),
    );
    for (const symbol of collectImportsFromSource(source)) {
      const resolved = resolveModule(symbol.specifier, file);
      if (!resolved) {
        continue;
      }
      if (!resolved.startsWith(rootDir)) {
        continue;
      }
      if (resolved.includes("node_modules")) {
        continue;
      }
      imports.add(symbol.name);
    }
  }
  return imports;
}

function resolveModule(specifier: string, fromFile: string): string | null {
  const resolution = ts.nodeModuleNameResolver(
    specifier,
    fromFile,
    compilerOptions,
    ts.sys,
  );
  const resolved = resolution.resolvedModule?.resolvedFileName;
  if (!resolved) {
    return null;
  }
  return path.resolve(resolved);
}

async function loadGallerySections(): Promise<
  readonly GallerySerializableSection[]
> {
  const mod = await import("../src/components/gallery/loader.ts");
  const { loadGalleryRegistry } = mod as typeof import("../src/components/gallery/loader");
  const registry = await loadGalleryRegistry();
  return registry.payload.sections;
}

type UsageMap = Record<string, readonly string[]>;

type NameToIdsMap = Map<string, readonly string[]>;

function buildNameLookup(sections: readonly GallerySerializableSection[]): {
  readonly complexEntries: readonly GallerySerializableEntry[];
  readonly nameToIds: NameToIdsMap;
} {
  const complexEntries: GallerySerializableEntry[] = [];
  const nameToIds = new Map<string, string[]>();
  for (const section of sections) {
    for (const entry of section.entries) {
      if (entry.kind !== "complex") {
        continue;
      }
      complexEntries.push(entry);
      const list = nameToIds.get(entry.name) ?? [];
      list.push(entry.id);
      nameToIds.set(entry.name, list);
    }
  }
  return {
    complexEntries,
    nameToIds,
  };
}

async function buildUsage(): Promise<UsageMap> {
  const sections = await loadGallerySections();
  const { complexEntries, nameToIds } = buildNameLookup(sections);
  const usage = new Map<string, Set<string>>();
  for (const entry of complexEntries) {
    usage.set(entry.id, new Set<string>());
  }

  const pageFiles = await fg(PAGE_GLOB, { cwd: appDir, absolute: true });
  for (const pageFile of pageFiles) {
    const routeDir = path.dirname(pageFile);
    const route = formatRoute(routeDir);
    const imports = await collectRouteImports(routeDir);
    for (const name of imports) {
      const ids = nameToIds.get(name);
      if (!ids) {
        continue;
      }
      for (const id of ids) {
        usage.get(id)?.add(route);
      }
    }
  }

  const record: UsageMap = {};
  for (const entry of complexEntries) {
    const routes = Array.from(
      usage.get(entry.id) ?? new Set<string>(),
    ).sort((a, b) => a.localeCompare(b));
    record[entry.id] = routes;
  }
  return record;
}

async function main(): Promise<void> {
  const trackedFiles = await fg(TRACKED_PATTERNS, {
    cwd: rootDir,
    absolute: true,
  });
  const usage = await buildUsage();
  await fs.mkdir(path.dirname(usageFile), { recursive: true });
  await fs.writeFile(usageFile, `${JSON.stringify(usage, null, 2)}\n`);
  await writeManifest([...new Set(trackedFiles)]);
  console.log(
    `Built gallery usage for ${Object.keys(usage).length} complex entries`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
