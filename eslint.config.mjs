import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import noRawDesignValuesRule from "./scripts/eslint-rules/no-raw-design-values.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});



const designPlugin = {
  rules: {
    "no-raw-design-values": noRawDesignValuesRule,
  },
};

const styledComponentsMessage =
  "Use the shared design system primitives and Tailwind utilities instead of styled-components.";

const restrictedDesignImports = [
  {
    name: "styled-components",
    message: styledComponentsMessage,
  },
  {
    name: "styled-components/macro",
    message: styledComponentsMessage,
  },
];

const restrictedDesignImportPatterns = [
  {
    group: ["styled-components/*"],
    message: styledComponentsMessage,
  },
];

const eslintConfig = [
  {
    ignores: [
      "src/components/gallery/generated-manifest.ts",
      "src/components/gallery/generated-manifest.g.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    files: ["**/*.{js,jsx,ts,tsx}", "**/*.cjs", "**/*.mjs"],
    plugins: {
      design: designPlugin,
    },
    rules: {
      // Styled-components bypasses our tokenized primitives and theming, so block it globally.
      // Keep this in sync with scripts/design-lint.ts so CI catches violations even when ESLint is skipped.
      "no-restricted-imports": [
        "error",
        {
          paths: restrictedDesignImports,
          patterns: restrictedDesignImportPatterns,
        },
      ],
      "design/no-raw-design-values": "error",
    },
  },
  {
    files: ["**/*.g.ts"],
    rules: {
      complexity: "off",
      "max-depth": "off",
      "max-lines": "off",
      "max-lines-per-function": "off",
      "max-nested-callbacks": "off",
      "max-statements": "off",
    },
  },
];


export default eslintConfig;
