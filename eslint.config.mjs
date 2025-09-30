import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import designTokensPlugin from "./eslint/plugins/design-tokens.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});



const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    plugins: {
      "design-tokens": designTokensPlugin,
    },
  },
  {
    files: [
      "src/components/planner/**/*.{ts,tsx}",
      "src/components/ui/theme/**/*.{ts,tsx}",
    ],
    rules: {
      "design-tokens/no-raw-colors": "error",
    },
  },
];


export default eslintConfig;
