import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { readdirSync } from "node:fs";
import { join } from "node:path";

type Options = {
  coveragePath: string;
  reportsRoot: string;
  outputPath?: string;
};

function parseArgs(): Options {
  const defaults: Options = {
    coveragePath: "artifacts/unit/coverage/coverage-summary.json",
    reportsRoot: "artifacts",
  };

  const args = process.argv.slice(2);
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index];
    const value = args[index + 1];
    if (!value) break;
    switch (key) {
      case "--coverage":
        defaults.coveragePath = value;
        break;
      case "--reports":
        defaults.reportsRoot = value;
        break;
      case "--output":
        defaults.outputPath = value;
        break;
      default:
        break;
    }
  }

  if (process.env.COVERAGE_SUMMARY_PATH) {
    defaults.coveragePath = process.env.COVERAGE_SUMMARY_PATH;
  }

  if (process.env.JUNIT_REPORT_ROOT) {
    defaults.reportsRoot = process.env.JUNIT_REPORT_ROOT;
  }

  if (process.env.SUMMARY_OUTPUT_PATH) {
    defaults.outputPath = process.env.SUMMARY_OUTPUT_PATH;
  }

  return defaults;
}

function readCoverage(coveragePath: string): string {
  if (!existsSync(coveragePath)) {
    return "Coverage — not available";
  }

  const data = JSON.parse(readFileSync(coveragePath, "utf8"));
  const linePct = data.total?.lines?.pct ?? null;
  const statementPct = data.total?.statements?.pct ?? null;
  const branchPct = data.total?.branches?.pct ?? null;
  const functionPct = data.total?.functions?.pct ?? null;

  const format = (value: number | null) =>
    typeof value === "number" ? value.toFixed(2) : "n/a";

  return [
    `Coverage — lines: ${format(linePct)}%`,
    `statements: ${format(statementPct)}%`,
    `branches: ${format(branchPct)}%`,
    `functions: ${format(functionPct)}%`,
  ].join(", ");
}

function collectJUnitFailures(root: string): string[] {
  if (!existsSync(root)) {
    return [];
  }

  const failures: string[] = [];

  const visit = (target: string) => {
    const entries = readdirSync(target, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(target, entry.name);
      if (entry.isDirectory()) {
        visit(full);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith(".xml")) {
        continue;
      }
      const xml = readFileSync(full, "utf8");
      const testcasePattern = /<testcase\b([^>]*)>([\s\S]*?)<\/testcase>/g;
      const selfClosingPattern = /<testcase\b([^>]*)\/>/g;

      const parseAttributes = (fragment: string) => {
        const attributes: Record<string, string> = {};
        const attrPattern = /(\w+)="([^"]*)"/g;
        let attrMatch: RegExpExecArray | null;
        while ((attrMatch = attrPattern.exec(fragment))) {
          attributes[attrMatch[1]] = attrMatch[2];
        }
        return attributes;
      };

      const extractFailure = (
        attrs: Record<string, string>,
        body: string,
      ) => {
        const failureMatch = body.match(/<failure\b([^>]*)>([\s\S]*?)<\/failure>/);
        if (!failureMatch) {
          return;
        }
        const failureAttributes = parseAttributes(failureMatch[1] ?? "");
        const name = attrs.name ?? "unknown";
        const classname = attrs.classname ?? "unknown";
        const message =
          failureAttributes.message ?? failureMatch[2]?.trim() ?? "Failure";
        failures.push(`• ${classname} :: ${name} — ${message}`);
      };

      let match: RegExpExecArray | null;
      while ((match = testcasePattern.exec(xml))) {
        const attrs = parseAttributes(match[1] ?? "");
        const body = match[2] ?? "";
        extractFailure(attrs, body);
      }

      while ((match = selfClosingPattern.exec(xml))) {
        // self-closing testcases cannot include failures
        void match;
      }
    }
  };

  visit(root);
  return failures;
}

function main() {
  const options = parseArgs();
  const coverageLine = readCoverage(options.coveragePath);
  const failures = collectJUnitFailures(options.reportsRoot);
  const failureBlock = failures.length
    ? ["Failures", ...failures].join("\n")
    : "Failures\n• None";

  const summary = `${coverageLine}\n${failureBlock}`;

  if (options.outputPath) {
    writeFileSync(options.outputPath, summary, "utf8");
  }

  process.stdout.write(summary);
}

main();
