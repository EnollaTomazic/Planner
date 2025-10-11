import path from 'node:path';
import { fileURLToPath } from 'node:url';

import nextPlugin from '@next/eslint-plugin-next';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

import noRawDesignValuesRule from './scripts/eslint-rules/no-raw-design-values.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const designPlugin = {
  rules: {
    'no-raw-design-values': noRawDesignValuesRule,
  },
};

const styledComponentsMessage =
  'Use the shared design system primitives and Tailwind utilities instead of styled-components.';

const restrictedDesignImports = [
  {
    name: 'styled-components',
    message: styledComponentsMessage,
  },
  {
    name: 'styled-components/macro',
    message: styledComponentsMessage,
  },
];

const restrictedDesignImportPatterns = [
  {
    group: ['styled-components/*'],
    message: styledComponentsMessage,
  },
];

const tsFlatConfigs = tsPlugin.configs['flat/recommended'] ?? [];
const tsBaseConfig = tsFlatConfigs[0] ?? {};
const typeCheckedRules = tsFlatConfigs.reduce((rules, config) => {
  if (config.rules) {
    Object.assign(rules, config.rules);
  }
  return rules;
}, {});

const tsLanguageOptions = {
  ...tsBaseConfig.languageOptions,
  parser: tsParser,
  parserOptions: {
    ...(tsBaseConfig.languageOptions?.parserOptions ?? {}),
    tsconfigRootDir: __dirname,
    projectService: true,
  },
};

const exportedAnyRestrictions = [
  {
    selector: 'ExportNamedDeclaration TSTypeAnnotation TSAnyKeyword',
    message: 'Do not export declarations typed as `any`.',
  },
  {
    selector: 'ExportNamedDeclaration[declaration.type="TSTypeAliasDeclaration"] TSAnyKeyword',
    message: 'Do not export types that contain `any`.',
  },
  {
    selector: 'ExportNamedDeclaration[declaration.type="TSInterfaceDeclaration"] TSAnyKeyword',
    message: 'Do not export interfaces that contain `any`.',
  },
];

const nextRequiredDefaultGlobs = [
  'src/components/**/page.{js,jsx,ts,tsx}',
  'src/components/**/layout.{js,jsx,ts,tsx}',
  'src/components/**/template.{js,jsx,ts,tsx}',
  'src/components/**/default.{js,jsx,ts,tsx}',
  'src/components/**/loading.{js,jsx,ts,tsx}',
  'src/components/**/error.{js,jsx,ts,tsx}',
  'src/components/**/not-found.{js,jsx,ts,tsx}',
];

const eslintConfig = [
  {
    ignores: [
      'src/components/gallery/generated-manifest.ts',
      'src/components/gallery/generated-manifest.g.ts',
    ],
  },
  {
    name: 'planner/core',
    files: [
      'app/**/*.{js,jsx,ts,tsx}',
      'src/**/*.{js,jsx,ts,tsx}',
      'lib/**/*.{js,jsx,ts,tsx}',
      'server/**/*.{js,jsx,ts,tsx}',
    ],
    plugins: {
      '@next/next': nextPlugin,
      design: designPlugin,
    },
    rules: {
      ...nextPlugin.flatConfig.coreWebVitals.rules,
      'no-restricted-imports': [
        'error',
        {
          paths: restrictedDesignImports,
          patterns: restrictedDesignImportPatterns,
        },
      ],
      'design/no-raw-design-values': 'error',
    },
  },
  {
    name: 'planner/typescript',
    files: [
      'app/**/*.{ts,tsx,mts,cts}',
      'src/**/*.{ts,tsx,mts,cts}',
      'lib/**/*.{ts,tsx,mts,cts}',
      'server/**/*.{ts,tsx,mts,cts}',
    ],
    languageOptions: tsLanguageOptions,
    plugins: {
      '@typescript-eslint': tsPlugin,
      '@next/next': nextPlugin,
      design: designPlugin,
    },
    rules: {
      ...typeCheckedRules,
      'no-restricted-syntax': ['error', ...exportedAnyRestrictions],
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
    },
  },
  {
    name: 'planner/scripts-and-config',
    files: [
      'scripts/**/*.{ts,tsx,mts,cts}',
      '*.config.{ts,tsx,mts,cts}',
      'security-headers.d.mts',
    ],
    plugins: {
      '@typescript-eslint': tsPlugin,
      '@next/next': nextPlugin,
      design: designPlugin,
    },
    languageOptions: tsLanguageOptions,
    rules: {
      ...typeCheckedRules,
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-expressions': 'warn',
      'design/no-raw-design-values': 'off',
    },
  },
  {
    name: 'planner/node-config',
    files: [
      'scripts/**/*.{js,mjs,cjs}',
      '*.config.{js,mjs,cjs}',
      'security-headers.mjs',
    ],
    plugins: {
      '@next/next': nextPlugin,
      design: designPlugin,
    },
    rules: {
      'design/no-raw-design-values': 'off',
    },
  },
  {
    name: 'planner/components',
    files: ['src/components/**/*.ts'],
    ignores: nextRequiredDefaultGlobs,
    rules: {
      'no-restricted-syntax': [
        'error',
        ...exportedAnyRestrictions,
        {
          selector: 'ExportDefaultDeclaration',
          message: 'Use named exports for shared components to encourage composability.',
        },
      ],
    },
  },
  {
    name: 'planner/utilities',
    files: ['src/utils/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: false,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
          allowDirectConstAssertionInArrowFunctions: true,
        },
      ],
    },
  },
  {
    files: ['**/*.g.ts'],
    rules: {
      complexity: 'off',
      'max-depth': 'off',
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'max-nested-callbacks': 'off',
      'max-statements': 'off',
    },
  },
];

export default eslintConfig;
