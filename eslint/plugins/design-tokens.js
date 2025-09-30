const SUGGESTION_MAP = [
  { find: "bg-card/55", replace: "surface-card-soft" },
  { find: "bg-card/70", replace: "surface-card-strong" },
  { find: "bg-card/80", replace: "surface-card-strong-active" },
  { find: "bg-card/85", replace: "surface-card-strong" },
  { find: "bg-card/90", replace: "surface-card-strong-today" },
  { find: "bg-accent-3/20", replace: "bg-interaction-info-tintActive" },
  { find: "bg-accent-3/30", replace: "bg-interaction-info-surfaceHover" },
];

const COLOR_PATTERNS = [
  { id: "hex", test: (value) => /#[0-9a-fA-F]{3,8}\b/.test(value) },
  {
    id: "rgb",
    test: (value) =>
      /\brgba?\s*\(/i.test(value) && !/var\s*\(/.test(value),
  },
  {
    id: "hsl",
    test: (value) =>
      /\bhsla?\s*\(/i.test(value) && !/hsl\(var\(/.test(value),
  },
  {
    id: "tailwindBgOpacity",
    test: (value) => /\bbg-[^\s"'`]*\/[0-9]{1,3}\b/.test(value),
  },
  {
    id: "arbitraryColor",
    test: (value) =>
      /\[(?:#|rgba?|hsla?|color-mix\()[^\]]*\]/i.test(value) &&
      !/\[var\(/.test(value),
  },
];

const createSuggestions = (nodeValue) => {
  let replacement = nodeValue;
  let changed = false;

  for (const { find, replace } of SUGGESTION_MAP) {
    if (replacement.includes(find)) {
      replacement = replacement.split(find).join(replace);
      changed = true;
    }
  }

  if (!changed) {
    return null;
  }

  return replacement;
};

const noRawColorsRule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow raw color literals within Planner surface directories.",
      recommended: false,
    },
    hasSuggestions: true,
    messages: {
      disallow:
        "Use design tokens or surface utilities instead of raw color literals.",
      suggest:
        "Swap raw color literals for token utilities such as surface-card-soft or bg-interaction-*.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.getFilename();
    if (filename === "<input>") {
      return {};
    }

    return {
      Literal(node) {
        if (typeof node.value !== "string") {
          return;
        }
        const value = node.value;
        if (!COLOR_PATTERNS.some((pattern) => pattern.test(value))) {
          return;
        }

        const suggestions = [];
        const replacement = createSuggestions(value);
        if (replacement && replacement !== value) {
          suggestions.push({
            messageId: "suggest",
            fix: (fixer) => fixer.replaceText(node, JSON.stringify(replacement)),
          });
        }

        context.report({
          node,
          messageId: "disallow",
          suggest: suggestions,
        });
      },
      TemplateLiteral(node) {
        const raw = node.quasis.map((q) => q.value.raw).join("${}");
        if (!COLOR_PATTERNS.some((pattern) => pattern.test(raw))) {
          return;
        }

        context.report({
          node,
          messageId: "disallow",
        });
      },
    };
  },
};

export default {
  rules: {
    "no-raw-colors": noRawColorsRule,
  },
};
