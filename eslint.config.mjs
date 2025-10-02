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

const eslintConfig = [
  {
    ignores: ["src/components/gallery/generated-manifest.ts"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    files: ["**/*.{js,jsx,ts,tsx}", "**/*.cjs", "**/*.mjs"],
    plugins: {
      design: designPlugin,
    },
    rules: {
      // Styled-components bypasses our tokenized primitives and theming, so block it globally.
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "styled-components",
              message:
                "Use the shared design system primitives and Tailwind utilities instead of styled-components.",
            },
          ],
        },
      ],
      "design/no-raw-design-values": "error",
    },
  },
];


export default eslintConfig;
