import "./check-node-version.js";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import fg from "fast-glob";
import { MultiBar, Presets } from "cli-progress";
import pLimit from "p-limit";
import ts from "typescript";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uiDir = path.resolve(__dirname, "../src/components/ui");
const indexFile = path.join(uiDir, "index.ts");
const cacheDir = path.join(__dirname, ".cache");
const manifestFile = path.join(cacheDir, "generate-ui-index.json");

type ManifestEntry = {
  mtimeMs: number;
  name?: string;
  valueExports: string[];
  typeExports: string[];
};
type Manifest = Record<string, ManifestEntry>;

async function loadManifest(): Promise<Manifest> {
  try {
    const data = await fs.readFile(manifestFile, "utf8");
    return JSON.parse(data) as Manifest;
  } catch {
    return {};
  }
}

async function saveManifest(manifest: Manifest) {
  await fs.mkdir(cacheDir, { recursive: true });
  await fs.writeFile(manifestFile, JSON.stringify(manifest, null, 2));
}

function toExportName(file: string): string {
  const base = path.basename(file).replace(/\.(tsx|ts)$/, "");
  const sanitized = base
    .replace(/[^A-Za-z0-9]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
    .replace(/^(.)/, (c) => c.toUpperCase());
  return sanitized;
}

type ExportInfo = {
  name?: string;
  valueExports: string[];
  typeExports: string[];
};

function hasModifier(node: ts.Node, kind: ts.SyntaxKind): boolean {
  if (!ts.canHaveModifiers(node)) {
    return false;
  }

  const modifiers = ts.getModifiers(node) ?? ts.factory.createNodeArray();
  return modifiers.some((modifier) => modifier.kind === kind);
}

function collectBindingNames(
  name: ts.BindingName,
  target: Set<string>,
): void {
  if (ts.isIdentifier(name)) {
    target.add(name.text);
    return;
  }

  for (const element of name.elements) {
    if (ts.isBindingElement(element)) {
      collectBindingNames(element.name, target);
    }
  }
}

function analyzeExports(file: string, content: string): ExportInfo {
  const source = ts.createSourceFile(
    file,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );

  const valueExports = new Set<string>();
  const typeExports = new Set<string>();
  let hasDefault = false;

  for (const statement of source.statements) {
    if (ts.isExportAssignment(statement)) {
      if (!statement.isExportEquals) {
        hasDefault = true;
      }
      continue;
    }

    if (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) {
      if (!hasModifier(statement, ts.SyntaxKind.ExportKeyword)) {
        continue;
      }

      if (hasModifier(statement, ts.SyntaxKind.DefaultKeyword)) {
        hasDefault = true;
        continue;
      }

      const name = statement.name?.text;
      if (name) {
        valueExports.add(name);
      }
      continue;
    }

    if (ts.isEnumDeclaration(statement)) {
      if (!hasModifier(statement, ts.SyntaxKind.ExportKeyword)) {
        continue;
      }

      const name = statement.name.text;
      valueExports.add(name);
      continue;
    }

    if (ts.isVariableStatement(statement)) {
      if (!hasModifier(statement, ts.SyntaxKind.ExportKeyword)) {
        continue;
      }

      for (const declaration of statement.declarationList.declarations) {
        collectBindingNames(declaration.name, valueExports);
      }
      continue;
    }

    if (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) {
      if (!hasModifier(statement, ts.SyntaxKind.ExportKeyword)) {
        continue;
      }

      const name = statement.name.text;
      typeExports.add(name);
      continue;
    }

    if (!ts.isExportDeclaration(statement)) {
      continue;
    }

    if (!statement.exportClause) {
      // export * from "..."; – skip to avoid duplicate surface exports
      continue;
    }

    if (ts.isNamespaceExport(statement.exportClause)) {
      const name = statement.exportClause.name.text;
      if (statement.isTypeOnly) {
        typeExports.add(name);
      } else {
        valueExports.add(name);
      }
      continue;
    }

    for (const element of statement.exportClause.elements) {
      const name = element.name.text;
      const target = element.isTypeOnly || statement.isTypeOnly ? typeExports : valueExports;
      target.add(name);
    }
  }

  return {
    name: hasDefault ? toExportName(file) : undefined,
    valueExports: Array.from(valueExports).sort((a, b) => a.localeCompare(b)),
    typeExports: Array.from(typeExports).sort((a, b) => a.localeCompare(b)),
  };
}

async function buildExport(file: string): Promise<ExportInfo> {
  const rel =
    "./" +
    path
      .relative(uiDir, file)
      .replace(/\\/g, "/")
      .replace(/\.(tsx|ts)$/, "");
  const content = await fs.readFile(file, "utf8");
  const exports = analyzeExports(file, content);

  return {
    name: exports.name,
    valueExports: exports.valueExports,
    typeExports: exports.typeExports,
  };
}

async function main() {
  const files = await fg(["**/*.{ts,tsx}", "!**/index.ts", "!**/index.tsx"], {
    cwd: uiDir,
    absolute: true,
  });
  const bars = new MultiBar(
    { clearOnComplete: false, hideCursor: true },
    Presets.shades_grey,
  );
  const bar = bars.create(files.length, 0);
  const manifest = await loadManifest();
  const nextManifest: Manifest = {};
  const exports = [
    "// Auto-generated by scripts/generate-ui-index.ts",
    "// Do not edit directly.",
  ];
  const usedDefaultAliases = new Set<string>();
  const usedValueExports = new Set<string>();
  const usedTypeExports = new Set<string>();
  const limit = pLimit(8);
  const sortedFiles = files.sort((a, b) => {
    const aRel = path.relative(uiDir, a).replace(/\\/g, "/");
    const bRel = path.relative(uiDir, b).replace(/\\/g, "/");
    const aIsGallery = /\.gallery\.(tsx|ts)$/.test(aRel);
    const bIsGallery = /\.gallery\.(tsx|ts)$/.test(bRel);
    if (aIsGallery !== bIsGallery) {
      return aIsGallery ? 1 : -1;
    }
    return aRel.localeCompare(bRel);
  });
  const results = await Promise.all(
    sortedFiles.map((file) =>
      limit(async () => {
        const rel = path.relative(uiDir, file).replace(/\\/g, "/");
        const stat = await fs.stat(file);
        let info = manifest[rel];
        if (
          !info ||
          info.mtimeMs !== stat.mtimeMs ||
          !Array.isArray(info.valueExports) ||
          !Array.isArray(info.typeExports)
        ) {
          const built = await buildExport(file);
          info = { mtimeMs: stat.mtimeMs, ...built };
        }
        bar.increment();
        return { rel, info };
      }),
    ),
  );
  for (const { rel, info } of results) {
    const importPath =
      "./" + rel.replace(/\\/g, "/").replace(/\.(tsx|ts)$/, "");

    const defaultAlias = info.name;
    const valueNames = info.valueExports ?? [];
    const typeNames = info.typeExports ?? [];

    if (
      defaultAlias &&
      !usedDefaultAliases.has(defaultAlias) &&
      !valueNames.includes(defaultAlias) &&
      !typeNames.includes(defaultAlias)
    ) {
      exports.push(`export { default as ${defaultAlias} } from "${importPath}";`);
      usedDefaultAliases.add(defaultAlias);
    }

    const valueExports = valueNames.filter((name) => {
      if (usedValueExports.has(name)) {
        return false;
      }
      usedValueExports.add(name);
      return true;
    });

    if (valueExports.length > 0) {
      exports.push(
        `export { ${valueExports.join(", ")} } from "${importPath}";`,
      );
    }

    const typeExports = typeNames.filter((name) => {
      if (usedTypeExports.has(name) || usedValueExports.has(name)) {
        return false;
      }
      usedTypeExports.add(name);
      return true;
    });

    if (typeExports.length > 0) {
      exports.push(
        `export type { ${typeExports.join(", ")} } from "${importPath}";`,
      );
    }

    nextManifest[rel] = info;
  }
  bars.stop();
  await saveManifest(nextManifest);
  exports.push("");
  await fs.writeFile(indexFile, exports.join("\n"));
  console.log(`Generated ${path.relative(process.cwd(), indexFile)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
