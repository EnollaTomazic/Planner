import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import { register } from "ts-node";

register({ transpileOnly: true });
const semanticTokensRule = (await import("./scripts/eslint-semantic-tokens.ts")).default;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    plugins: {
      "semantic-tokens": {
        rules: { "no-raw-colors": semanticTokensRule },
      },
    },
    rules: {
      "semantic-tokens/no-raw-colors": "error",
    },
  },
];

export default eslintConfig;
