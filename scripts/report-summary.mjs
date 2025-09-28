#!/usr/bin/env node
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const args = new Map();
for (const entry of process.argv.slice(2)) {
  if (!entry.startsWith("--")) continue;
  const [rawKey, ...rest] = entry.slice(2).split("=");
  const key = rawKey.trim();
  const value = rest.length > 0 ? rest.join("=") : "true";
  args.set(key, value);
}

const coveragePath = args.get("coverage") ?? "coverage/coverage-summary.json";
const junitInputs = (args.get("junit") ?? "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const outputPath = args.get("out") ?? "";

const summary = {
  coverage: null,
  unitFailures: [],
  e2eFailures: [],
};

const decodeEntities = (value) =>
  value
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");

const readIfExists = async (filePath) => {
  try {
    await stat(filePath);
    return await readFile(filePath, "utf-8");
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
};

const parseJUnitFailures = (xml) => {
  if (!xml) return [];
  const failures = [];
  const testcasePattern = /<testcase\b([^>]*)>([\s\S]*?)<\/testcase>/g;
  let match;
  while ((match = testcasePattern.exec(xml)) !== null) {
    const attributes = match[1];
    const body = match[2];
    if (!/<(failure|error)\b/.test(body)) continue;
    const nameMatch = attributes.match(/\bname="([^"]*)"/);
    const classMatch = attributes.match(/\bclassname="([^"]*)"/);
    const failureMatch = body.match(/<(failure|error)[^>]*>([\s\S]*?)<\/(failure|error)>/);
    failures.push({
      name: nameMatch ? decodeEntities(nameMatch[1]) : "unknown",
      scope: classMatch ? decodeEntities(classMatch[1]) : "",
      message: failureMatch ? decodeEntities(failureMatch[2].trim()) : "",
    });
  }
  return failures;
};

const main = async () => {
  const coverageRaw = await readIfExists(coveragePath);
  if (coverageRaw) {
    try {
      const coverageJson = JSON.parse(coverageRaw);
      const total = coverageJson.total ?? {};
      summary.coverage = {
        statements: total.statements?.pct ?? null,
        branches: total.branches?.pct ?? null,
        functions: total.functions?.pct ?? null,
        lines: total.lines?.pct ?? null,
      };
    } catch (error) {
      summary.coverage = { error: `Failed to parse coverage summary: ${error.message}` };
    }
  }

  const junitFiles = [];
  for (const junitPath of junitInputs) {
    if (!junitPath) continue;
    const resolved = path.resolve(process.cwd(), junitPath);
    let stats;
    try {
      stats = await stat(resolved);
    } catch (error) {
      if (error && error.code === "ENOENT") {
        continue;
      }
      throw error;
    }
    if (stats.isDirectory()) {
      const stack = [resolved];
      while (stack.length) {
        const current = stack.pop();
        const entries = await readdir(current, { withFileTypes: true });
        for (const entry of entries) {
          const target = path.join(current, entry.name);
          if (entry.isDirectory()) {
            stack.push(target);
          } else if (entry.isFile() && target.toLowerCase().endsWith(".xml")) {
            junitFiles.push(target);
          }
        }
      }
    } else if (stats.isFile()) {
      junitFiles.push(resolved);
    }
  }

  for (const junitPath of junitFiles) {
    const xml = await readIfExists(junitPath);
    if (!xml) continue;
    const failures = parseJUnitFailures(xml);
    if (failures.length === 0) continue;
    const isE2E = junitPath.toLowerCase().includes("playwright");
    if (isE2E) {
      summary.e2eFailures.push(...failures);
    } else {
      summary.unitFailures.push(...failures);
    }
  }

  if (outputPath) {
    const resolved = path.resolve(process.cwd(), outputPath);
    await mkdir(path.dirname(resolved), { recursive: true });
    await writeFile(resolved, JSON.stringify(summary, null, 2), { encoding: "utf-8" });
  } else {
    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
