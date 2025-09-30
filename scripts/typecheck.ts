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
  const configPath = path.resolve(projectDir, "tsconfig.json");
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    projectDir,
  );

  fs.mkdirSync(path.join(projectDir, ".cache"), { recursive: true });

  const rootFiles = new Set(parsed.fileNames.map((f) => path.normalize(f)));
  const total = rootFiles.size;
  const bars = new MultiBar(
    { clearOnComplete: false, hideCursor: true },
    Presets.shades_grey,
  );
  const bar = bars.create(total, 0);
  let completed = 0;

  const host = ts.createIncrementalCompilerHost(parsed.options);
  const origGetSourceFile = host.getSourceFile;
  host.getSourceFile = (
    fileName,
    languageVersion,
    onError,
    shouldCreateNewSourceFile,
  ) => {
    const result = origGetSourceFile(
      fileName,
      languageVersion,
      onError,
      shouldCreateNewSourceFile,
    );
    const norm = path.normalize(fileName);
    if (rootFiles.has(norm)) {
      completed += 1;
      bar.update(completed);
      rootFiles.delete(norm);
    }
    return result;
  };

  const program = ts.createIncrementalProgram({
    rootNames: parsed.fileNames,
    options: {
      ...parsed.options,
      noEmit: true,
      incremental: true,
      tsBuildInfoFile: path.join(projectDir, ".cache/tsbuildinfo"),
    },
    host,
  });

  const diagnostics = ts.getPreEmitDiagnostics(program.getProgram());
  const filteredDiagnostics = diagnostics.filter((diagnostic) => {
    if (diagnostic.code !== 2590) {
      return true;
    }

    const fileName = diagnostic.file?.fileName ?? "";
    if (fileName.endsWith(path.join("src", "components", "gallery", "generated-manifest.ts"))) {
      return false;
    }

    return true;
  });
  bars.stop();

  if (filteredDiagnostics.length) {
    const formatHost: ts.FormatDiagnosticsHost = {
      getCanonicalFileName: (f) => f,
      getCurrentDirectory: () => projectDir,
      getNewLine: () => ts.sys.newLine,
    };
    const formatter = pretty
      ? ts.formatDiagnosticsWithColorAndContext
      : ts.formatDiagnostics;
    console.error(formatter(filteredDiagnostics, formatHost));
    process.exit(1);
  }
  console.log("Type check passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
