#!/usr/bin/env node
import { spawn } from "node:child_process";
import fs from "node:fs";
import { mkdirSync } from "node:fs";
import path from "node:path";

const junitOutput = process.env.VITEST_JUNIT_OUTPUT || "reports/vitest/junit.xml";
mkdirSync(path.dirname(junitOutput), { recursive: true });

const extraArgs = process.argv.slice(2);
const args = [
  "run",
  "--coverage",
  "--coverage.provider=v8",
  "--coverage.reporter=lcov",
  "--coverage.reporter=text-summary",
  "--coverage.reporter=json-summary",
  "--reporter=default",
  "--reporter=junit",
  `--outputFile=${junitOutput}`,
  ...extraArgs,
];

fs.rmSync(junitOutput, { force: true });

const child = spawn("vitest", args, {
  stdio: "inherit",
  env: {
    ...process.env,
    CI: process.env.CI ?? "true",
  },
});

child.on("exit", (code) => {
  reportFailuresFromJUnit(junitOutput);
  process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});

function reportFailuresFromJUnit(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }
  const xml = fs.readFileSync(filePath, "utf8");
  const testcaseRegex = /<testcase\b([^>]*)>([\s\S]*?)<\/testcase>/g;
  let match;
  while ((match = testcaseRegex.exec(xml)) !== null) {
    const [, attributes, body] = match;
    if (!body.includes("<failure")) {
      continue;
    }
    const classnameMatch = attributes.match(/classname="([^"]+)"/u);
    const nameMatch = attributes.match(/name="([^"]+)"/u);
    const failureMatch = body.match(/<failure[^>]*>([\s\S]*?)<\/failure>/u);
    let relativePath = classnameMatch?.[1] ?? "";
    let message = failureMatch?.[1] ?? nameMatch?.[1] ?? "Vitest assertion failed";
    message = message.replace(/<!\[CDATA\[|\]\]>/gu, "").trim();
    let line = 1;
    let column = 1;
    const locationMatch = message.match(/([^\s():]+\.(?:ts|tsx|js|jsx)):(\d+):(\d+)/u);
    if (locationMatch) {
      relativePath = locationMatch[1];
      line = Number.parseInt(locationMatch[2], 10) || 1;
      column = Number.parseInt(locationMatch[3], 10) || 1;
    }
    const normalizedPath = path.relative(process.cwd(), relativePath);
    console.log(`::error file=${normalizedPath},line=${line},col=${column}::${message}`);
  }
}
