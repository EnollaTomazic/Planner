import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import tailwindConfig from "../tailwind.config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function collectTokens(obj: Record<string, any>, prefix = ""): string[] {
  const tokens: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      tokens.push(prefix + key);
    } else if (typeof value === "object" && value) {
      tokens.push(...collectTokens(value as Record<string, any>, `${prefix + key}-`));
    }
  }
  return tokens;
}

const tailwindTokens = new Set(
  collectTokens((tailwindConfig.theme?.extend as any)?.colors ?? {}),
);

const mappingsRaw = readFileSync(
  path.resolve(__dirname, "../COLOR_MAPPINGS.md"),
  "utf8",
);
const colorMappings = new Set<string>();
for (const line of mappingsRaw.split("\n")) {
  const match = line.match(/\| `([^`]+)` \|/);
  if (match) {
    colorMappings.add(match[1]);
  }
}

const prefixes = [
  "bg",
  "text",
  "border",
  "from",
  "to",
  "via",
  "ring",
  "stroke",
  "fill",
  "shadow",
];

const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "enforce semantic color tokens or mapped raw colors",
    },
    messages: {
      unknownToken: "Color token \"{{token}}\" not found in tailwind.config.ts.",
      unmappedColor:
        "Color value \"{{color}}\" is not mapped in COLOR_MAPPINGS.md.",
    },
    schema: [],
  },
  create(context: any) {
    return {
      JSXAttribute(node: any) {
        if (
          (node.name as any).name !== "class" &&
          (node.name as any).name !== "className"
        ) {
          return;
        }
        if (!node.value) {
          return;
        }
        if (node.value.type !== "Literal" || typeof node.value.value !== "string") {
          return;
        }
        const classes = node.value.value.split(/\s+/);
        for (const cls of classes) {
          const prefix = prefixes.find((p) => cls.startsWith(`${p}-`));
          if (!prefix) continue;
          const rest = cls.slice(prefix.length + 1);
          const base = rest.split("/")[0];
          if (base.startsWith("[")) {
            const raw = base.slice(1, -1);
            if (!colorMappings.has(raw)) {
              context.report({
                node: node.value,
                messageId: "unmappedColor",
                data: { color: raw },
              });
            }
          } else if (!tailwindTokens.has(base)) {
            context.report({
              node: node.value,
              messageId: "unknownToken",
              data: { token: base },
            });
          }
        }
      },
    };
  },
};

export default rule;
