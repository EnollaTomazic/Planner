import "./check-node-version.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ts from "typescript";
import { MultiBar, Presets } from "cli-progress";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const prettyArg = args.find((arg) => arg === "--pretty" || arg.startsWith("--pretty="));
  const pretty = (() => {
    if (prettyArg === "--pretty") {
      return true;
    }
    if (prettyArg?.startsWith("--pretty=")) {
      const [, value] = prettyArg.split("=", 2);
      return value !== "false" && value !== "0";
    }
    if (args.includes("--no-pretty")) {
      return false;
    }
    return !process.env.CI;
  })();
  const projectDir = path.resolve(__dirname, "..");
  const configPath = path.resolve(projectDir, "tsconfig.build.json");
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    projectDir,
  );

  fs.mkdirSync(path.join(projectDir, ".cache"), { recursive: true });

  const rawManifestSuffixes = [
    path.normalize("src/components/gallery/generated-manifest.ts"),
  ];

  const ignoredDiagnosticSuffixes = [
    ...rawManifestSuffixes,
    path.normalize("src/components/gallery/generated-manifest.g.ts"),
  ];

  const filteredRootNames = parsed.fileNames.filter((fileName) => {
    const normalized = path.normalize(fileName);
    return !rawManifestSuffixes.some((suffix) =>
      normalized.endsWith(suffix),
    );
  });

  parsed.fileNames = filteredRootNames;

  const rootFiles = new Set(filteredRootNames.map((f) => path.normalize(f)));
  const total = rootFiles.size;
  const bars = new MultiBar(
    { clearOnComplete: false, hideCursor: true },
    Presets.shades_grey,
  );
  const bar = bars.create(total, 0);
  let completed = 0;

  const host = ts.createIncrementalCompilerHost(parsed.options);
  const origGetSourceFile = host.getSourceFile;
  const manifestStub = [
    "import type { Manifest } from './manifest.schema';",
    "",
    "export const galleryPayload = {} as Manifest['galleryPayload'];",
    "export const galleryPreviewModules = {} as Manifest['galleryPreviewModules'];",
    "export const galleryPreviewRoutes = {} as Manifest['galleryPreviewRoutes'];",
    "",
    "export const manifest = {",
    "  galleryPayload,",
    "  galleryPreviewModules,",
    "  galleryPreviewRoutes,",
    "} as Manifest;",
    "",
    "export default manifest;",
    "",
  ].join("\n");

  host.getSourceFile = (
    fileName,
    languageVersion,
    onError,
    shouldCreateNewSourceFile,
  ) => {
    const norm = path.normalize(fileName);
    if (rawManifestSuffixes.some((suffix) => norm.endsWith(suffix))) {
      const source = ts.createSourceFile(
        fileName,
        manifestStub,
        parsed.options.target ?? ts.ScriptTarget.ESNext,
        true,
        ts.ScriptKind.TS,
      ) as ts.SourceFile & { version: string };
      source.version = "stub";
      return source;
    }
    const result = origGetSourceFile(
      fileName,
      languageVersion,
      onError,
      shouldCreateNewSourceFile,
    );
    if (rootFiles.has(norm)) {
      completed += 1;
      bar.update(completed);
      rootFiles.delete(norm);
    }
    return result;
  };

  const program = ts.createIncrementalProgram({
    rootNames: filteredRootNames,
    options: {
      ...parsed.options,
      noEmit: true,
      incremental: true,
      tsBuildInfoFile: path.join(projectDir, ".cache/tsbuildinfo"),
    },
    host,
  });

  const diagnostics = ts
    .getPreEmitDiagnostics(program.getProgram())
    .filter((diagnostic) => {
      if (diagnostic.code !== 2589 && diagnostic.code !== 2590) {
        return true;
      }
      const fileName = diagnostic.file?.fileName;
      if (!fileName) {
        return true;
      }
      const normalized = path.normalize(fileName);
      if (
        ignoredDiagnosticSuffixes.some((suffix) =>
          normalized.endsWith(suffix),
        )
      ) {
        // Ignore union size explosions from the large auto-generated manifest file.
        return false;
      }
      return true;
    });
  bars.stop();

  if (diagnostics.length) {
    const formatHost: ts.FormatDiagnosticsHost = {
      getCanonicalFileName: (f) => f,
      getCurrentDirectory: () => projectDir,
      getNewLine: () => ts.sys.newLine,
    };
    const formatter = pretty
      ? ts.formatDiagnosticsWithColorAndContext
      : ts.formatDiagnostics;
    console.error(formatter(diagnostics, formatHost));
    process.exit(1);
  }
  console.log("Type check passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
