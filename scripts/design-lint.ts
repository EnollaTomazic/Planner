import "./check-node-version.js";
import fs from "fs";
import fg from "fast-glob";

const files = await fg(["src/**/*.{ts,tsx,css}"], { ignore: ["**/*.d.ts"] });

const colorRe = /(#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\()/;
const spacingRe = /(p|gap)-\[[^\]]*px\]/;
const stylePxRe = /style={{[^}]*\d+px/;
const radiusRe = /rounded-(sm|md|lg|xl|2xl|\[[^\]]+\])/;
const borderRe = /border-(\d+)/g;
const outlineRe = /(?:outline-[^\s'"`]+|\[outline:[^\]]+\]|outline\s*:)/;
const ringRe = /ring(?:-[^\s'"`]+)?/g;
const rawElementRe = /<(button|input)(\s|>)/;

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
    if (spacingRe.test(line) || stylePxRe.test(line)) {
      violations.push({ file, line: ln, text: line.trim(), rule: "spacing" });
    }
    if (radiusRe.test(line)) {
      violations.push({ file, line: ln, text: line.trim(), rule: "radius" });
    }
    let match;
    while ((match = borderRe.exec(line)) !== null) {
      if (parseInt(match[1], 10) > 1) {
        violations.push({ file, line: ln, text: line.trim(), rule: "border" });
      }
    }
    if (outlineRe.test(line)) {
      violations.push({ file, line: ln, text: line.trim(), rule: "outline" });
    }
    const rings = line.match(ringRe);
    if (rings && rings.length > 1) {
      violations.push({ file, line: ln, text: line.trim(), rule: "ring" });
    }
    if (rawElementRe.test(line)) {
      violations.push({ file, line: ln, text: line.trim(), rule: "element" });
    }
  });
}

const suggestions: Record<string, string> = {
  color: "use color tokens",
  spacing: "use spacing tokens",
  radius: "use radius tokens",
  border: "use border tokens",
  outline: "use focus ring tokens",
  ring: "use a single ring token",
  element: "use design system primitives",
};

if (violations.length) {
  console.log("Design lint found issues:\n");
  for (const v of violations) {
    console.log(`--- ${v.file}:${v.line}`);
    console.log(`- ${v.text}`);
    console.log(`+ ${suggestions[v.rule]}`);
  }
  process.exit(1);
} else {
  console.log("No design lint issues found.");
}
