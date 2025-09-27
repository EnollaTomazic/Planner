#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function getFlagValue(flag, args) {
  const index = args.indexOf(flag);
  if (index === -1 || index === args.length - 1) {
    return undefined;
  }
  return args[index + 1];
}

function readJsonIfExists(filePath) {
  if (!filePath) {
    return undefined;
  }
  if (!fs.existsSync(filePath)) {
    return undefined;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function parseCoverageSummary(filePath) {
  const data = readJsonIfExists(filePath);
  if (!data) {
    return undefined;
  }
  const total = data.total;
  if (!total) {
    return undefined;
  }
  const pct = (value) =>
    typeof value === "number" && Number.isFinite(value)
      ? `${value.toFixed(1)}%`
      : "n/a";
  return {
    statements: pct(total.statements?.pct),
    branches: pct(total.branches?.pct),
    functions: pct(total.functions?.pct),
    lines: pct(total.lines?.pct),
  };
}

function parseJUnitSuite(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return undefined;
  }
  const xml = fs.readFileSync(filePath, "utf8");
  const match = xml.match(
    /<testsuite[^>]*tests="(?<tests>\d+)"[^>]*failures="(?<failures>\d+)"[^>]*skipped="(?<skipped>\d+)"[^>]*time="(?<time>[0-9.]+)"/u,
  );
  if (!match || !match.groups) {
    return undefined;
  }
  return {
    tests: Number(match.groups.tests),
    failures: Number(match.groups.failures),
    skipped: Number(match.groups.skipped),
    time: Number(match.groups.time),
  };
}

function walkDirectoryForFiles(baseDir, targetName) {
  if (!baseDir || !fs.existsSync(baseDir)) {
    return [];
  }
  const entries = fs.readdirSync(baseDir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const resolved = path.join(baseDir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDirectoryForFiles(resolved, targetName));
    } else if (entry.isFile() && entry.name === targetName) {
      results.push(resolved);
    }
  }
  return results;
}

function loadAxeSummaries(baseDir) {
  const axeFiles = walkDirectoryForFiles(baseDir, "axe-report.json");
  if (axeFiles.length === 0) {
    return [];
  }
  return axeFiles.map((file) => {
    const relative = path.relative(baseDir, file);
    const content = fs.readFileSync(file, "utf8");
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed?.violations)) {
        const blockers = parsed.violations.filter((item) => item.impact === "critical");
        return `- ${relative}: ${blockers.length} critical issues`;
      }
    } catch (error) {
      // Non-JSON content is handled below.
    }
    return `- ${relative}: ${content.trim()}`;
  });
}

function formatJUnitSummary(label, suite) {
  if (!suite) {
    return `- ${label}: no results`;
  }
  const status = suite.failures > 0 ? "⚠️" : "✅";
  const skipped = suite.skipped > 0 ? `, skipped ${suite.skipped}` : "";
  return `${status} ${label}: ran ${suite.tests} checks, failures ${suite.failures}${skipped}`;
}

const args = process.argv.slice(2);
const coveragePath = getFlagValue("--coverage", args);
const vitestJUnit = getFlagValue("--vitest-junit", args);
const playwrightDir = getFlagValue("--playwright", args);
const outputPath = getFlagValue("--output", args) ?? "ci-summary.md";

const coverage = parseCoverageSummary(coveragePath);
const unitSuite = parseJUnitSuite(vitestJUnit);
const playwrightSuites = walkDirectoryForFiles(playwrightDir, "junit.xml").map((file) => ({
  file,
  suite: parseJUnitSuite(file),
}));
const axeSummaries = loadAxeSummaries(playwrightDir);

const lines = [];
lines.push("## CI Summary");
if (coverage) {
  lines.push(
    `- Coverage ⇒ statements ${coverage.statements}, branches ${coverage.branches}, functions ${coverage.functions}, lines ${coverage.lines}`,
  );
} else {
  lines.push("- Coverage ⇒ not available");
}
lines.push("");
lines.push("### Unit tests");
lines.push(formatJUnitSummary("Vitest", unitSuite));
lines.push("");
lines.push("### Playwright");
if (playwrightSuites.length === 0) {
  lines.push("- No Playwright reports");
} else {
  for (const { file, suite } of playwrightSuites) {
    const label = path.basename(path.dirname(file));
    lines.push(formatJUnitSummary(label, suite));
  }
}
if (axeSummaries.length > 0) {
  lines.push("");
  lines.push("### Axe findings");
  lines.push(...axeSummaries);
}

fs.writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");
