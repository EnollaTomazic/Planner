import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fg from "fast-glob";

const ROOT = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));

const TARGET_GLOBS = [
  "src/components/planner/**/*.{ts,tsx}",
  "src/components/ui/theme/**/*.{ts,tsx}",
];

const REPLACEMENTS: Array<{ find: RegExp; replace: string }> = [
  { find: /bg-card\/55/g, replace: "surface-card-soft" },
  { find: /bg-card\/70/g, replace: "surface-card-strong" },
  { find: /bg-card\/80/g, replace: "surface-card-strong-active" },
  { find: /bg-card\/85/g, replace: "surface-card-strong" },
  { find: /bg-card\/90/g, replace: "surface-card-strong-today" },
  { find: /hover:bg-card\/70/g, replace: "hover:surface-card-strong" },
  {
    find: /focus-visible:bg-card\/70/g,
    replace: "focus-visible:surface-card-strong",
  },
  { find: /active:bg-card\/80/g, replace: "active:surface-card-strong-active" },
  { find: /active:bg-card\/85/g, replace: "active:surface-card-strong" },
  {
    find: /group-hover:bg-card\/70/g,
    replace: "group-hover:surface-card-strong",
  },
  {
    find: /group-active:bg-card\/80/g,
    replace: "group-active:surface-card-strong-active",
  },
  {
    find: /group-focus-within:bg-card\/70/g,
    replace: "group-focus-within:surface-card-strong",
  },
  {
    find: /bg-accent-3\/20/g,
    replace: "bg-interaction-info-tintActive",
  },
  {
    find: /bg-accent-3\/30/g,
    replace: "bg-interaction-info-surfaceHover",
  },
];

const run = async () => {
  const files = await fg(TARGET_GLOBS, {
    cwd: ROOT,
    absolute: true,
  });

  if (files.length === 0) {
    console.log("No target files found.");
    return;
  }

  let updated = 0;

  await Promise.all(
    files.map(async (filePath) => {
      const original = await readFile(filePath, "utf8");
      let next = original;

      for (const { find, replace } of REPLACEMENTS) {
        next = next.replace(find, replace);
      }

      if (next !== original) {
        await writeFile(filePath, next, "utf8");
        updated += 1;
        console.log(`Updated ${path.relative(ROOT, filePath)}`);
      }
    }),
  );

  if (updated === 0) {
    console.log("No replacements were necessary.");
  } else {
    console.log(`Rewrote ${updated} file(s).`);
  }
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
