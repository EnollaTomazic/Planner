import fs from "fs";
import fg from "fast-glob";

const files = await fg(["src/**/*.{ts,tsx}"], { ignore: ["**/*.d.ts"] });

const colorRe = /(#(?:[0-9a-fA-F]{3,8})\b|rgb[a]?\()/;
const pxBracketRe = /p-\[[^\]]*px\]/;
const pxClassRe = /\bpx-(5|6)\b/;
const borderRe = /border-(\d+)/g;

interface Violation {
  file: string;
  line: number;
  text: string;
  rule: string;
}

const violations: Violation[] = [];

for (const file of files) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, idx) => {
    const ln = idx + 1;
    if (colorRe.test(line)) {
      violations.push({ file, line: ln, text: line.trim(), rule: "color" });
    }
    if (pxBracketRe.test(line) || pxClassRe.test(line)) {
      violations.push({ file, line: ln, text: line.trim(), rule: "spacing" });
    }
    let match;
    while ((match = borderRe.exec(line)) !== null) {
      if (parseInt(match[1], 10) > 1) {
        violations.push({ file, line: ln, text: line.trim(), rule: "border" });
      }
    }
  });
}

if (violations.length) {
  console.log("Design lint found issues:\n");
  for (const v of violations) {
    console.log(`--- ${v.file}:${v.line}`);
    console.log(`- ${v.text}`);
  }
  process.exit(1);
} else {
  console.log("No design lint issues found.");
}
