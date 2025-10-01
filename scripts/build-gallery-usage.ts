import "./check-node-version.js";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import fg from "fast-glob";
import ts from "typescript";
import {
  createGalleryRegistry,
  type GalleryRegistryPayload,
  type GallerySection,
  type GallerySerializableEntry,
  type GallerySerializableSection,
  type GalleryPreviewRoute,
} from "../src/components/gallery/registry";
import { BG_CLASSES, VARIANTS } from "../src/lib/theme";
import type { Background, Variant } from "../src/lib/theme";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const appDir = path.join(rootDir, "src/app");
const cacheDir = path.join(__dirname, ".cache");
const manifestFile = path.join(cacheDir, "build-gallery-usage.json");
const galleryDir = path.join(rootDir, "src/components/gallery");
const usageFile = path.join(galleryDir, "usage.json");
const manifestOutput = path.join(galleryDir, "generated-manifest.ts");
const tsconfigPath = path.join(rootDir, "tsconfig.json");

const TRACKED_PATTERNS = [
  "src/app/**/*.{ts,tsx}",
  "src/components/**/*.gallery.{ts,tsx}",
];

const PAGE_GLOB = "**/page.{ts,tsx}";
const ROUTE_FILE_GLOB = "**/*.{ts,tsx}";
const GALLERY_GLOB = "src/components/**/**/*.gallery.{ts,tsx}";

const PREVIEW_VARIANTS =
  VARIANTS.map(({ id }) => id) as ReadonlyArray<Variant>;
const PREVIEW_BACKGROUNDS =
  BG_CLASSES.map((_, index) => index as Background) as ReadonlyArray<Background>;

const REGISTERED_VARIANTS = new Set(VARIANTS.map((variant) => variant.id));

for (const variant of PREVIEW_VARIANTS) {
  if (!REGISTERED_VARIANTS.has(variant)) {
    throw new Error(`Preview variant \"${variant}\" is not registered`);
  }
}

const PREVIEW_THEME_COMBOS = PREVIEW_VARIANTS.flatMap((variant) =>
  PREVIEW_BACKGROUNDS.map(
    (bg) => ({ variant, bg }) satisfies { variant: Variant; bg: Background },
  ),
);

type GalleryModuleExport = {
  readonly default: GallerySection | readonly GallerySection[];
};

interface GalleryModuleMeta {
  readonly file: string;
  readonly importPath: string;
  readonly sections: readonly GallerySection[];
  readonly previewIds: readonly string[];
}

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

type UsageMap = Record<string, readonly string[]>;

type NameToIdsMap = Map<string, readonly string[]>;

function normalizeSlug(value: string | null | undefined): string {
  if (!value) {
    return "";
  }
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/gu, "-")
    .replace(/[\s_]+/gu, "-")
    .replace(/-+/gu, "-")
    .replace(/^-+|-+$/gu, "");
}

function formatPreviewSlug(
  sectionSlug: string,
  entrySlug: string,
  previewSlug: string,
  stateSlug: string | null,
  theme: { variant: Variant; bg: Background },
): string {
  const parts = [`section-${sectionSlug}`, `entry-${entrySlug}`, `preview-${previewSlug}`];
  if (stateSlug) {
    parts.push(`state-${stateSlug}`);
  }
  parts.push(`theme-${theme.variant}`);
  if (theme.bg > 0) {
    parts.push(`bg-${theme.bg}`);
  }
  return parts.join("--");
}

function buildPreviewRoutes(
  sections: readonly GallerySerializableSection[],
): readonly GalleryPreviewRoute[] {
  const routes: GalleryPreviewRoute[] = [];
  const slugSet = new Set<string>();

  const register = (route: GalleryPreviewRoute) => {
    if (slugSet.has(route.slug)) {
      throw new Error(`Duplicate gallery preview slug generated: ${route.slug}`);
    }
    slugSet.add(route.slug);
    routes.push(route);
  };

  for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex += 1) {
    const section = sections[sectionIndex];
    const sectionSlugBase = normalizeSlug(section.id);
    const sectionSlug = sectionSlugBase || `section-${sectionIndex + 1}`;

    for (
      let entryIndex = 0;
      entryIndex < section.entries.length;
      entryIndex += 1
    ) {
      const entry = section.entries[entryIndex];
      const entrySlugBase =
        normalizeSlug(entry.id) || normalizeSlug(entry.name) || null;
      const fallbackEntrySlug =
        normalizeSlug(`${section.id}-${entryIndex + 1}`) ||
        `component-${entryIndex + 1}`;
      const entrySlug = entrySlugBase ?? fallbackEntrySlug;
      const previewSlug =
        normalizeSlug(entry.preview.id) ||
        normalizeSlug(`${entrySlug}-preview`) ||
        `preview-${sectionIndex + 1}-${entryIndex + 1}`;

      for (const theme of PREVIEW_THEME_COMBOS) {
        const slug = formatPreviewSlug(
          sectionSlug,
          entrySlug,
          previewSlug,
          null,
          theme,
        );
        register({
          slug,
          previewId: entry.preview.id,
          entryId: entry.id,
          entryName: entry.name,
          sectionId: section.id,
          stateId: null,
          stateName: null,
          themeVariant: theme.variant,
          themeBackground: theme.bg,
        });
      }

      if (entry.states) {
        for (
          let stateIndex = 0;
          stateIndex < entry.states.length;
          stateIndex += 1
        ) {
          const state = entry.states[stateIndex];
          const stateSlugBase =
            normalizeSlug(state.id) ||
            normalizeSlug(state.name) ||
            normalizeSlug(`${entrySlug}-state-${stateIndex + 1}`) ||
            `state-${stateIndex + 1}`;
          const statePreviewSlug =
            normalizeSlug(state.preview.id) ||
            normalizeSlug(`${entrySlug}-${stateSlugBase}-preview`) ||
            `preview-${sectionIndex + 1}-${entryIndex + 1}-${stateIndex + 1}`;

          for (const theme of PREVIEW_THEME_COMBOS) {
            const slug = formatPreviewSlug(
              sectionSlug,
              entrySlug,
              statePreviewSlug,
              stateSlugBase,
              theme,
            );
            register({
              slug,
              previewId: state.preview.id,
              entryId: entry.id,
              entryName: entry.name,
              sectionId: section.id,
              stateId: state.id,
            stateName: state.name ?? null,
            themeVariant: theme.variant,
            themeBackground: theme.bg,
          });
        }
      }
      }
    }
  }

  routes.sort((a, b) => a.slug.localeCompare(b.slug));
  return routes;
}

function buildNameLookup(sections: readonly GallerySerializableSection[]): {
  readonly entries: readonly GallerySerializableEntry[];
  readonly nameToIds: NameToIdsMap;
} {
  const entries: GallerySerializableEntry[] = [];
  const nameToIds = new Map<string, string[]>();
  for (const section of sections) {
    for (const entry of section.entries) {
      entries.push(entry);
      const list = nameToIds.get(entry.name) ?? [];
      list.push(entry.id);
      nameToIds.set(entry.name, list);
    }
  }
  return {
    entries,
    nameToIds,
  };
}

async function buildUsage(
  sections: readonly GallerySerializableSection[],
): Promise<UsageMap> {
  const { entries, nameToIds } = buildNameLookup(sections);
  const usage = new Map<string, Set<string>>();
  for (const entry of entries) {
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
  for (const entry of entries) {
    const routes = Array.from(
      usage.get(entry.id) ?? new Set<string>(),
    ).sort((a, b) => a.localeCompare(b));
    record[entry.id] = routes;
  }
  return record;
}

function formatImportPath(file: string): string {
  const relative = path
    .relative(galleryDir, file)
    .replace(/\\/g, "/")
    .replace(/\.(ts|tsx)$/u, "");
  if (relative.startsWith(".")) {
    return relative;
  }
  return `./${relative}`;
}

function collectPreviewIds(sections: readonly GallerySection[]): string[] {
  const ids: string[] = [];
  for (const section of sections) {
    for (const entry of section.entries) {
      ids.push(entry.preview.id);
      if (entry.states) {
        for (const state of entry.states) {
          ids.push(state.preview.id);
        }
      }
    }
  }
  return ids;
}

async function loadGalleryModuleSections(
  file: string,
): Promise<readonly GallerySection[]> {
  const moduleUrl = pathToFileURL(file).href;
  const mod = (await import(moduleUrl)) as GalleryModuleExport;
  const exported = mod.default;
  const sections = Array.isArray(exported) ? exported : [exported];
  return sections;
}

async function collectGalleryModules(): Promise<readonly GalleryModuleMeta[]> {
  const files = await fg(GALLERY_GLOB, { cwd: rootDir, absolute: true });
  const sortedFiles = [...files].sort();
  const modules: GalleryModuleMeta[] = [];
  for (const file of sortedFiles) {
    const sections = await loadGalleryModuleSections(file);
    modules.push({
      file,
      importPath: formatImportPath(file),
      sections,
      previewIds: collectPreviewIds(sections),
    });
  }
  return modules;
}

const REQUIRED_MANIFEST_EXPORTS = [
  "export const galleryPayload",
  "export const galleryPreviewRoutes",
  "export const galleryPreviewModules",
] as const;

function buildGalleryManifestSource(
  modules: readonly GalleryModuleMeta[],
  payload: GalleryRegistryPayload,
  previewRoutes: readonly GalleryPreviewRoute[],
): string {
  const lines = [
    "// Auto-generated by scripts/build-gallery-usage.ts",
    "// Do not edit directly.",
    'import type { GalleryRegistryPayload, GallerySection, GalleryPreviewRoute } from "./registry";',
    "",
    "export interface GalleryModuleExport {",
    "  readonly default: GallerySection | readonly GallerySection[];",
    "}",
    "",
    "export interface GalleryPreviewModuleManifest {",
    "  readonly loader: () => Promise<GalleryModuleExport>;",
    "  readonly previewIds: readonly string[];",
    "}",
    "",
    `export const galleryPayload = ${JSON.stringify(payload, null, 2)} satisfies GalleryRegistryPayload;`,
    "",
    `const galleryPreviewRoutesData = ${JSON.stringify(previewRoutes, null, 2)} as const;`,
    "",
    "export const galleryPreviewRoutes =",
    "  galleryPreviewRoutesData as unknown as readonly GalleryPreviewRoute[];",
    "",
    "export const galleryPreviewModules = [",
  ];

  for (const moduleMeta of modules) {
    const previewLines = moduleMeta.previewIds.map((id) => `      "${id}",`);
    lines.push(
      "  {",
      `    loader: () => import("${moduleMeta.importPath}"),`,
      "    previewIds: [",
      ...previewLines,
      "    ],",
      "  },",
    );
  }

  lines.push(
    "] satisfies readonly GalleryPreviewModuleManifest[];",
    "",
    "export default galleryPreviewModules;",
    "",
  );

  return `${lines.join("\n")}\n`;
}

function validateManifestSource(source: string): void {
  for (const requiredExport of REQUIRED_MANIFEST_EXPORTS) {
    if (!source.includes(requiredExport)) {
      throw new Error(
        `Generated gallery manifest is missing required export: "${requiredExport}"`,
      );
    }
  }

  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ESNext,
    },
    fileName: pathToFileURL(manifestOutput).href,
    reportDiagnostics: true,
  });

  const diagnostics = transpiled.diagnostics ?? [];
  if (diagnostics.length > 0) {
    const message = diagnostics
      .map((diagnostic) =>
        ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
      )
      .join("\n");
    throw new Error(
      `Generated gallery manifest contains TypeScript syntax errors:\n${message}`,
    );
  }
}

async function buildGalleryManifest(
  modules: readonly GalleryModuleMeta[],
  payload: GalleryRegistryPayload,
  previewRoutes: readonly GalleryPreviewRoute[],
): Promise<void> {
  const source = buildGalleryManifestSource(modules, payload, previewRoutes);
  validateManifestSource(source);

  await fs.mkdir(path.dirname(manifestOutput), { recursive: true });
  await fs.writeFile(manifestOutput, source);
}

async function main(): Promise<void> {
  const trackedFiles = await fg(TRACKED_PATTERNS, {
    cwd: rootDir,
    absolute: true,
  });
  const modules = await collectGalleryModules();
  const allSections = modules.flatMap((module) => module.sections);
  const registry = createGalleryRegistry(allSections);
  const usage = await buildUsage(registry.payload.sections);
  const previewRoutes = buildPreviewRoutes(registry.payload.sections);
  await fs.mkdir(path.dirname(usageFile), { recursive: true });
  await fs.writeFile(usageFile, `${JSON.stringify(usage, null, 2)}\n`);
  await buildGalleryManifest(modules, registry.payload, previewRoutes);
  await writeManifest([...new Set(trackedFiles)]);
  console.log(`Built gallery usage for ${Object.keys(usage).length} entries`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
