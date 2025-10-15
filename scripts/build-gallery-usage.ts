import "./check-node-version.js";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import fg from "fast-glob";
import ts from "typescript";
import { writeFileAtomically } from "./utils/write-file-atomically";
import type {
  GalleryRegistryPayload,
  GallerySection,
  GallerySerializableEntry,
  GallerySerializableSection,
  GalleryPreviewRoute,
  GalleryStateDefinition,
} from "../src/components/gallery/registry";
import type { Background, Variant } from "../src/lib/theme";
import { ManifestPayloadSchema, ManifestRouteSchema } from "../src/components/gallery/manifest.schema";

const SAFE_MODE_DEFAULT = "true";

function ensureSafeModeEnv(): void {
  const nextPublicSafeMode = process.env.NEXT_PUBLIC_SAFE_MODE;
  const safeMode = process.env.SAFE_MODE;

  if (nextPublicSafeMode === undefined && safeMode === undefined) {
    process.env.NEXT_PUBLIC_SAFE_MODE = SAFE_MODE_DEFAULT;
    process.env.SAFE_MODE = SAFE_MODE_DEFAULT;
    return;
  }

  if (nextPublicSafeMode === undefined && safeMode !== undefined) {
    process.env.NEXT_PUBLIC_SAFE_MODE = safeMode;
  }

  if (safeMode === undefined && nextPublicSafeMode !== undefined) {
    process.env.SAFE_MODE = nextPublicSafeMode;
  }
}

ensureSafeModeEnv();

const [galleryModule, themeModule] = (await Promise.all([
  import("../src/components/gallery/registry"),
  import("../src/lib/theme"),
])) as [
  typeof import("../src/components/gallery/registry"),
  typeof import("../src/lib/theme"),
];

const { createGalleryRegistry } = galleryModule;
const { BG_CLASSES, VARIANTS } = themeModule;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const appDir = path.join(rootDir, "src/app");
const cacheDir = path.join(__dirname, ".cache");
const manifestFile = path.join(cacheDir, "build-gallery-usage.json");
const galleryDir = path.join(rootDir, "src/components/gallery");
const usageFile = path.join(galleryDir, "usage.json");
const manifestOutput = path.join(galleryDir, "generated-manifest.ts");
const manifestEntrypointOutput = path.join(
  galleryDir,
  "generated-manifest.g.ts",
);
const tsconfigPath = path.join(rootDir, "tsconfig.build.json");

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

const JSON_INDENT = "  ";

const AI_ABORT_BUTTON_ENTRY_ID = "ai-abort-button";
const AI_ABORT_BUTTON_SECTION_ID = "buttons";

interface AiAbortStateConfig {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly previewId: string;
  readonly busy: boolean;
  readonly className: string | null;
  readonly label: string | null;
  readonly children: string | null;
}

const AI_ABORT_BUTTON_STATE_CONFIGS = [
  {
    id: "abort-busy",
    name: "Busy state",
    description: "Active abort button uses danger tone for clarity.",
    previewId: "prompts:buttons:ai-abort-button:state:abort-busy",
    busy: true,
    className: null,
    label: null,
    children: null,
  },
  {
    id: "abort-idle",
    name: "Idle lockout",
    description: "Idle state disables the control once streaming finishes.",
    previewId: "prompts:buttons:ai-abort-button:state:abort-idle",
    busy: false,
    className: null,
    label: null,
    children: null,
  },
  {
    id: "abort-custom-label",
    name: "Custom label",
    description: "Custom label keeps tone and icon alignment intact.",
    previewId: "prompts:buttons:ai-abort-button:state:abort-custom-label",
    busy: true,
    className: "w-full justify-center",
    label: null,
    children: "Stop stream",
  },
] as const satisfies readonly AiAbortStateConfig[];

const modulesWithAiAbortAugmentation = new Set<string>();

const sanitizeJsonLiteral = (value: unknown): unknown => {
  if (value === null) {
    return null;
  }

  const valueType = typeof value;

  if (valueType === "string" || valueType === "boolean") {
    return value;
  }

  if (valueType === "number") {
    return Number.isFinite(value as number) ? value : null;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return [];
    }

    return value.map((item) => {
      if (item === undefined || typeof item === "function" || typeof item === "symbol") {
        return null;
      }

      const sanitized = sanitizeJsonLiteral(item);
      return sanitized === undefined ? null : sanitized;
    });
  }

  if (isRecord(value)) {
    const result: Record<string, unknown> = {};

    for (const [key, entryValue] of Object.entries(value)) {
      if (entryValue === undefined) {
        continue;
      }

      const entryType = typeof entryValue;
      if (entryType === "function" || entryType === "symbol") {
        continue;
      }

      const sanitized = sanitizeJsonLiteral(entryValue);
      if (sanitized === undefined) {
        continue;
      }

      result[key] = sanitized;
    }

    return result;
  }

  return null;
};

const serializeJsonLiteral = (value: unknown): string => {
  const sanitized = sanitizeJsonLiteral(value);
  const serialized = JSON.stringify(sanitized, null, JSON_INDENT);
  if (serialized === undefined) {
    return "null";
  }
  return serialized;
};

const REGISTERED_VARIANTS = new Set(VARIANTS.map((variant) => variant.id));

const IGNORED_MANIFEST_DIAGNOSTIC_CODES = new Set([2589, 2590]);
const IGNORED_MANIFEST_SUFFIXES = [
  path.normalize("src/components/gallery/generated-manifest.ts"),
  path.normalize("src/components/gallery/generated-manifest.g.ts"),
];

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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

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
  await writeFileAtomically(manifestFile, JSON.stringify(entries, null, 2));
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

const createAiAbortStatePlaceholder = (
  config: AiAbortStateConfig,
): GalleryStateDefinition => ({
  id: config.id,
  name: config.name,
  description: config.description,
  preview: {
    id: config.previewId,
    render: () => null,
  },
});

function augmentSectionsWithAiAbortStates(
  importPath: string,
  sections: readonly GallerySection[],
): readonly GallerySection[] {
  let mutated = false;

  const augmentedSections = sections.map((section) => {
    if (section.id !== AI_ABORT_BUTTON_SECTION_ID) {
      return section;
    }

    let entriesMutated = false;
    const entries = section.entries.map((entry) => {
      if (entry.id !== AI_ABORT_BUTTON_ENTRY_ID) {
        return entry;
      }

      const existingStates = Array.isArray(entry.states)
        ? [...entry.states]
        : [];

      let statesMutated = false;
      for (const config of AI_ABORT_BUTTON_STATE_CONFIGS) {
        if (existingStates.some((state) => state?.id === config.id)) {
          continue;
        }

        existingStates.push(createAiAbortStatePlaceholder(config));
        statesMutated = true;
      }

      if (!statesMutated) {
        return entry;
      }

      entriesMutated = true;
      return {
        ...entry,
        states: existingStates,
      } satisfies GallerySection["entries"][number];
    });

    if (!entriesMutated) {
      return section;
    }

    mutated = true;
    return {
      ...section,
      entries,
    } satisfies GallerySection;
  });

  if (mutated) {
    modulesWithAiAbortAugmentation.add(importPath);
    return augmentedSections;
  }

  return sections;
}

async function collectGalleryModules(): Promise<readonly GalleryModuleMeta[]> {
  const files = await fg(GALLERY_GLOB, { cwd: rootDir, absolute: true });
  const sortedFiles = [...files].sort();
  const modules: GalleryModuleMeta[] = [];
  for (const file of sortedFiles) {
    const sections = await loadGalleryModuleSections(file);
    const importPath = formatImportPath(file);
    const augmentedSections = augmentSectionsWithAiAbortStates(
      importPath,
      sections,
    );
    modules.push({
      file,
      importPath,
      sections: augmentedSections,
      previewIds: collectPreviewIds(augmentedSections),
    });
  }
  return modules;
}

const REQUIRED_MANIFEST_EXPORTS = [
  "export const galleryPayload =",
  "satisfies GalleryRegistryPayload;",
  "export const galleryPreviewRoutes =",
  "satisfies readonly GalleryPreviewRoute[];",
  "export const galleryPreviewModules = Object.freeze",
  "satisfies Record<string, GalleryPreviewModuleManifest>;",
] as const;

function buildGalleryManifestSource(
  modules: readonly GalleryModuleMeta[],
  payload: GalleryRegistryPayload,
  previewRoutes: readonly GalleryPreviewRoute[],
): string {
  const payloadJson = serializeJsonLiteral(payload);
  const routesJson = serializeJsonLiteral(previewRoutes);
  const hasAiAbortAugmentation = modules.some((module) =>
    modulesWithAiAbortAugmentation.has(module.importPath),
  );

  const lines = [
    "// Auto-generated by scripts/build-gallery-usage.ts",
    "// Do not edit directly.",
  ];

  if (hasAiAbortAugmentation) {
    lines.push('import * as React from "react";');
    lines.push(
      'import type { AIAbortButton } from "../ui/ai/AIAbortButton";',
    );
  }

  lines.push(
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
  );

  if (hasAiAbortAugmentation) {
    const aiAbortConfigJson = JSON.stringify(
      AI_ABORT_BUTTON_STATE_CONFIGS,
      null,
      2,
    )
      .split("\n")
      .map((line) => `  ${line}`)
      .join("\n");

    lines.push(
      "type AiAbortButtonComponent = typeof AIAbortButton;",
      "",
      "interface AiAbortStateConfig {",
      "  readonly id: string;",
      "  readonly name: string;",
      "  readonly description: string;",
      "  readonly previewId: string;",
      "  readonly busy: boolean;",
      "  readonly className: string | null;",
      "  readonly label: string | null;",
      "  readonly children: string | null;",
      "}",
      "",
      "const AI_ABORT_BUTTON_ENTRY_ID = \"ai-abort-button\";",
      "const AI_ABORT_BUTTON_SECTION_ID = \"buttons\";",
      "const noop = () => {};",
      "",
      "const AI_ABORT_BUTTON_STATE_CONFIGS = Object.freeze(",
      aiAbortConfigJson,
      ") satisfies readonly AiAbortStateConfig[];",
      "",
      "const applyAiAbortButtonStates = (",
      "  module: GalleryModuleExport,",
      "  Component: AiAbortButtonComponent,",
      "): GalleryModuleExport => {",
      "  const exported = module.default;",
      "  const sections = Array.isArray(exported) ? exported : [exported];",
      "",
      "  for (const section of sections) {",
      "    if (!section || section.id !== AI_ABORT_BUTTON_SECTION_ID) {",
      "      continue;",
      "    }",
      "",
      "    if (!Array.isArray(section.entries)) {",
      "      continue;",
      "    }",
      "",
      "    for (const entry of section.entries) {",
      "      if (!entry || entry.id !== AI_ABORT_BUTTON_ENTRY_ID) {",
      "        continue;",
      "      }",
      "",
      "      const existingStates = Array.isArray(entry.states)",
      "        ? [...entry.states]",
      "        : [];",
      "",
      "      for (const stateConfig of AI_ABORT_BUTTON_STATE_CONFIGS) {",
      "        if (existingStates.some((state) => state?.id === stateConfig.id)) {",
      "          continue;",
      "        }",
      "",
      "        existingStates.push({",
      "          id: stateConfig.id,",
      "          name: stateConfig.name,",
      "          description: stateConfig.description,",
      "          preview: {",
      "            id: stateConfig.previewId,",
      "            render: () =>",
      "              React.createElement(",
      "                Component,",
      "                {",
      "                  onAbort: noop,",
      "                  busy: stateConfig.busy,",
      "                  className: stateConfig.className ?? undefined,",
      "                  label: stateConfig.label ?? undefined,",
      "                },",
      "                stateConfig.children ?? undefined,",
      "              ),",
      "          },",
      "        });",
      "      }",
      "",
      "      entry.states = existingStates;",
      "    }",
      "  }",
      "",
      "  return module;",
      "};",
      "",
    );
  }

  lines.push(
    `export const galleryPayload = ${payloadJson} as const satisfies GalleryRegistryPayload;`,
    "",
    `export const galleryPreviewRoutes = ${routesJson} as const satisfies readonly GalleryPreviewRoute[];`,
    "",
    "export const galleryPreviewModules = Object.freeze({",
  );

  for (const moduleMeta of modules) {
    const previewLines =
      moduleMeta.previewIds.length > 0
        ? moduleMeta.previewIds.map((id) => `      "${id}",`)
        : [];
    const loaderLines = modulesWithAiAbortAugmentation.has(
      moduleMeta.importPath,
    )
      ? [
          `    loader: async () => {`,
          `      const module = await import("${moduleMeta.importPath}");`,
          `      const { AIAbortButton } = await import("../ui/ai/AIAbortButton");`,
          "      return applyAiAbortButtonStates(module, AIAbortButton);",
          "    },",
        ]
      : [`    loader: () => import("${moduleMeta.importPath}"),`];

    lines.push(
      `  "${moduleMeta.importPath}": Object.freeze({`,
      ...loaderLines,
      "    previewIds: [",
      ...previewLines,
      "    ] as const,",
      "  }),",
    );
  }

  lines.push(
    "}) satisfies Record<string, GalleryPreviewModuleManifest>;",
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

  const diagnostics = (transpiled.diagnostics ?? []).filter((diagnostic) => {
    if (!IGNORED_MANIFEST_DIAGNOSTIC_CODES.has(diagnostic.code)) {
      return true;
    }

    const fileName = diagnostic.file?.fileName;
    if (!fileName) {
      return true;
    }

    let normalized: string;
    try {
      normalized = path.normalize(fileURLToPath(fileName));
    } catch {
      normalized = path.normalize(fileName);
    }

    return !IGNORED_MANIFEST_SUFFIXES.some((suffix) =>
      normalized.endsWith(suffix),
    );
  });
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
  await writeFileAtomically(manifestOutput, source);

  const checksum = createHash("sha256").update(source).digest("hex").slice(0, 8);
  const entrypointSource = [
    "// Auto-generated by scripts/build-gallery-usage.ts",
    `// checksum: ${checksum}`,
    "import type { Manifest } from './manifest.schema'",
    "import {",
    "  galleryPayload,",
    "  galleryPreviewModules,",
    "  galleryPreviewRoutes,",
    "} from './generated-manifest'",
    "",
    "export const manifest = {",
    "  galleryPayload,",
    "  galleryPreviewModules,",
    "  galleryPreviewRoutes,",
    "} as const satisfies Manifest",
    "",
    "export { galleryPayload, galleryPreviewModules, galleryPreviewRoutes }",
    "",
    "export default manifest",
    "",
  ].join("\n");

  await writeFileAtomically(manifestEntrypointOutput, `${entrypointSource}\n`);
}

async function main(): Promise<void> {
  const trackedFiles = await fg(TRACKED_PATTERNS, {
    cwd: rootDir,
    absolute: true,
  });
  modulesWithAiAbortAugmentation.clear();
  const modules = await collectGalleryModules();
  const allSections = modules.flatMap((module) => module.sections);
  const registry = createGalleryRegistry(allSections);
  const usage = await buildUsage(registry.payload.sections);
  const previewRoutes = buildPreviewRoutes(registry.payload.sections);

  ManifestPayloadSchema.parse(registry.payload);
  ManifestRouteSchema.array().parse(previewRoutes);

  await fs.mkdir(path.dirname(usageFile), { recursive: true });
  await writeFileAtomically(usageFile, `${JSON.stringify(usage, null, 2)}\n`);
  await buildGalleryManifest(modules, registry.payload, previewRoutes);
  await writeManifest([...new Set(trackedFiles)]);
}

main().catch((error) => {
  const message =
    error instanceof Error
      ? error.stack ?? error.message
      : typeof error === "string"
        ? error
        : JSON.stringify(error);
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
