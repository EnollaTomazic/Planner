import { dirname } from "path";
import { fileURLToPath } from "url";
import nextConfig from "eslint-config-next";
import prettierConfig from "eslint-config-prettier";
import noRawDesignValuesRule from "./scripts/eslint-rules/no-raw-design-values.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sanitizePluginMap = (plugins) => {
  if (!plugins) {
    return plugins;
  }

  return Object.fromEntries(
    Object.entries(plugins).map(([name, plugin]) => {
      if (plugin && typeof plugin === "object" && "configs" in plugin) {
        const { configs: _configs, ...rest } = plugin;
        return [name, rest];
      }

      return [name, plugin];
    })
  );
};

const [nextCoreWebVitals, nextTypescript, nextIgnores] = nextConfig.map(
  (config) => ({
    ...config,
    plugins: sanitizePluginMap(config.plugins),
  })
);

const reactHooksRuleOverrides = Object.fromEntries(
  Object.keys(nextCoreWebVitals.rules ?? {})
    .filter(
      (name) =>
        name.startsWith("react-hooks/") &&
        name !== "react-hooks/rules-of-hooks" &&
        name !== "react-hooks/exhaustive-deps"
    )
    .map((name) => [name, "off"])
);

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

const designRuleTargets = [
  "{app,src,tests,storybook}/**/*.{js,jsx,ts,tsx}",
  "**/*.cjs",
  "**/*.mjs",
];

const eslintConfig = [
  {
    ignores: [
      "src/components/gallery/generated-manifest.ts",
      "src/components/gallery/generated-manifest.g.ts",
      "storybook-static/**",
      ...(nextIgnores?.ignores ?? []),
    ],
  },
  {
    ...nextCoreWebVitals,
    rules: {
      ...nextCoreWebVitals.rules,
      ...(prettierConfig.rules ?? {}),
      ...reactHooksRuleOverrides,
    },
  },
  {
    ...nextTypescript,
    languageOptions: {
      ...nextTypescript.languageOptions,
      parserOptions: {
        ...nextTypescript.languageOptions?.parserOptions,
        project: ["./tsconfig.json", "./tsconfig.storybook.json"],
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    files: designRuleTargets,
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
  {
    files: ["src/lib/**/*.{ts,tsx}", "src/utils/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],
    },
  },
  {
    files: ["types/**/*.d.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
];


export default eslintConfig;
