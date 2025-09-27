#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const baseArgs = [
  "-r",
  "./scripts/setup-eslint-flat.cjs",
  "./node_modules/eslint/bin/eslint.js",
];

const targets = ["app", "src"];
const argv = process.argv.slice(2);
let outputFile = "reports/eslint/eslint.json";
const passthrough = [];

for (let index = 0; index < argv.length; index += 1) {
  const token = argv[index];
  if (token === "--output-file" && index < argv.length - 1) {
    outputFile = argv[index + 1];
    index += 1;
    continue;
  }
  passthrough.push(token);
}

const eslintArgs = [
  "node",
  ...baseArgs,
  "--cache",
  "--cache-location",
  ".eslintcache",
  "--max-warnings=0",
  "--format",
  "json",
  "--output-file",
  outputFile,
  ...targets,
  ...passthrough,
];

fs.mkdirSync(path.dirname(outputFile), { recursive: true });

const result = spawnSync(eslintArgs[0], eslintArgs.slice(1), {
  stdio: "inherit",
  env: {
    ...process.env,
    CI: process.env.CI ?? "true",
  },
});

if (result.error) {
  console.error(result.error);
  process.exit(result.status ?? 1);
}

const exitCode = result.status ?? 0;

if (fs.existsSync(outputFile)) {
  try {
    const raw = fs.readFileSync(outputFile, "utf8");
    const parsed = JSON.parse(raw);
    for (const file of parsed) {
      const relativePath = path.relative(process.cwd(), file.filePath);
      for (const message of file.messages ?? []) {
        const location = `file=${relativePath},line=${message.line ?? 1},col=${message.column ?? 1}`;
        const rule = message.ruleId ? ` (${message.ruleId})` : "";
        console.log(`::${message.severity === 2 ? "error" : "warning"} ${location}::${message.message}${rule}`);
      }
    }
  } catch (error) {
    console.warn(`Failed to parse ESLint report at ${outputFile}:`, error);
  }
}

process.exit(exitCode);
