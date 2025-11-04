import './check-node-version.js';
import StyleDictionary from 'style-dictionary';
import type { FormatFnArguments, TransformedToken } from 'style-dictionary/types';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createProgressBar, stopBars } from '../src/utils/progress.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DESIGN_TOKENS_PATH = path.resolve(
  __dirname,
  '../tokens/design_tokens.json',
);

const DEPRECATED_TOKENS = new Set([
  'shadow-glow-small',
  'shadow-glow-strong',
  'progress-ring-diameter',
  'progress-ring-stroke',
  'progress-ring-inset',
  'timer-ring-diameter',
  'timer-ring-stroke',
  'timer-ring-inset',
]);

const REQUIRED_THEME_TOKEN_GROUPS = {
  depth: [
    'neo-depth-sm',
    'neo-depth-md',
    'neo-depth-lg',
    'neo-surface',
    'neo-surface-alt',
    'neo-highlight',
    'depth-shadow-outer',
    'depth-shadow-outer-strong',
    'depth-shadow-soft',
    'depth-shadow-inner',
    'shadow-outer-sm',
    'shadow-outer-md',
    'shadow-outer-lg',
    'shadow-outer-xl',
    'shadow-inner-sm',
    'shadow-inner-md',
    'shadow-inner-lg',
    'depth-glow-highlight-soft',
    'depth-glow-highlight-medium',
    'depth-glow-highlight-strong',
    'depth-glow-shadow-soft',
    'depth-glow-shadow-medium',
    'depth-glow-shadow-strong',
    'depth-focus-ring-rest',
    'depth-focus-ring-active',
    'glow-ring-sm',
    'glow-ring-md',
    'glow-ring',
    'card-elev-1',
    'card-elev-2',
    'card-elev-3',
  ],
  organicBackdrop: [
    'backdrop-blob-1',
    'backdrop-blob-2',
    'backdrop-blob-3',
    'backdrop-blob-shadow',
    'backdrop-grid-primary',
    'backdrop-grid-secondary',
    'backdrop-grid-opacity',
    'backdrop-drip-1',
    'backdrop-drip-2',
    'backdrop-drip-3',
    'backdrop-drip-shadow',
    'blob-surface',
    'blob-surface-1',
    'blob-surface-2',
    'blob-surface-3',
    'blob-surface-shadow',
    'drip-surface',
    'blob-radius-soft',
    'gradient-blob-primary',
  ],
  glitch: [
    'neo-glow-strength',
    'neon-outline-opacity',
    'glitch-intensity-default',
    'glitch-intensity-subtle',
    'glitch-intensity',
    'glitch-duration',
    'glitch-fringe',
    'glitch-static-opacity',
    'glitch-noise-level',
    'glitch-overlay-opacity-card',
    'glitch-overlay-button-opacity',
    'glitch-overlay-button-opacity-reduced',
    'glitch-chromatic-offset-strong',
    'glitch-chromatic-offset-medium',
    'glitch-chromatic-offset-light',
    'glitch-halo-opacity',
    'glitch-ring-color',
    'glitch-ring-blur',
    'glitch-ring-shadow',
    'glitch-accent-color',
    'glitch-accent-blur',
    'glitch-accent-shadow',
    'glitch-noise-primary',
    'glitch-noise-secondary',
    'glitch-noise-contrast',
    'glitch-noise-hover',
    'gradient-glitch-primary',
  ],
  motion: [
    'motion-duration-sm',
    'motion-duration-md',
    'motion-duration-lg',
    'motion-ease-glitch',
    'glitch-scanline',
    'glitch-rgb-shift',
    'glow-pulse',
  ],
} as const;

interface TokenDefinition {
  value: string;
  comment?: string | string[];
  group: string;
}

interface FlatTokens {
  [name: string]: TokenDefinition;
}

type RawToken = string | { value: string; comment?: string | string[] };

type DesignTokenSchema = Record<string, Record<string, RawToken>>;

const toKebabCase = (value: string): string =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z])([0-9])/gi, '$1-$2')
    .replace(/([0-9])([a-z])/gi, '$1-$2')
    .toLowerCase();

StyleDictionary.registerTransform({
  name: 'name/kebab-with-digits',
  type: 'name',
  transform: (token) => toKebabCase(token.path.join('-')),
});

function normalizeToken(name: string, group: string, raw: RawToken): TokenDefinition {
  if (typeof raw === 'string') {
    return { value: raw, group };
  }
  if (!raw || typeof raw.value !== 'string') {
    throw new Error(
      `Invalid token definition for "${group}.${name}" in design_tokens.json`,
    );
  }
  return { value: raw.value, comment: raw.comment, group };
}

function flattenTokens(schema: DesignTokenSchema): FlatTokens {
  return Object.entries(schema).reduce<FlatTokens>((acc, [group, tokens]) => {
    for (const [name, raw] of Object.entries(tokens)) {
      const normalized = normalizeToken(name, group, raw);
      if (acc[name]) {
        throw new Error(
          `Duplicate token "${name}" encountered while processing design_tokens.json`,
        );
      }
      acc[name] = normalized;
    }
    return acc;
  }, {});
}

function assertRequiredThemeTokens(tokens: FlatTokens): void {
  const available = new Set(Object.keys(tokens).map((token) => toKebabCase(token)));

  const missingByGroup = Object.entries(REQUIRED_THEME_TOKEN_GROUPS).flatMap(
    ([group, requiredTokens]) =>
      requiredTokens
        .filter((token) => !available.has(token))
        .map((token) => `${group}: ${token}`),
  );

  if (missingByGroup.length > 0) {
    throw new Error(
      [
        'Missing theme token coverage for:',
        ...missingByGroup.map((entry) => `- ${entry}`),
        'Update tokens/design_tokens.json to keep the token pipeline in sync.',
      ].join('\n'),
    );
  }
}

function assertNoDeprecatedTokens(tokens: FlatTokens): void {
  const kebabTokens = new Set(Object.keys(tokens).map((token) => toKebabCase(token)));
  const deprecated = Array.from(DEPRECATED_TOKENS).filter((token) =>
    kebabTokens.has(token),
  );

  if (deprecated.length > 0) {
    throw new Error(
      [
        'Deprecated tokens remain in tokens/design_tokens.json:',
        ...deprecated.map((token) => `- ${token}`),
        'Remove or rename these entries before regenerating design tokens.',
      ].join('\n'),
    );
  }
}

StyleDictionary.registerFormat({
  name: 'tokens/markdown',
  format: ({ dictionary }: FormatFnArguments): string => {
    const lines = dictionary.allTokens.map(
      (token: TransformedToken) => `| ${token.name} | ${token.value} |`,
    );
    return ['| Token | Value |', '| --- | --- |', ...lines].join('\n');
  },
});

async function buildTokens(): Promise<void> {
  const schemaRaw = await fs.readFile(DESIGN_TOKENS_PATH, 'utf8');
  const schema = JSON.parse(schemaRaw) as DesignTokenSchema;
  const tokens = flattenTokens(schema);

  assertNoDeprecatedTokens(tokens);
  assertRequiredThemeTokens(tokens);

  const sdTokens = Object.fromEntries(
    Object.entries(tokens).map(([name, definition]) => [name, { value: definition.value }]),
  );

  const sd = new StyleDictionary({
    tokens: sdTokens,
    platforms: {
      css: {
        transforms: ['attribute/cti', 'name/kebab-with-digits'],
        buildPath: 'tokens/',
        files: [{ destination: 'tokens.css', format: 'css/variables' }],
      },
      js: {
        transforms: ['attribute/cti', 'name/camel'],
        buildPath: 'tokens/',
        files: [
          {
            destination: 'tokens.js',
            format: 'javascript/esm',
            options: { flat: true },
          },
        ],
      },
      ts: {
        transforms: ['attribute/cti', 'name/camel'],
        buildPath: 'tokens/',
        files: [{ destination: 'tokens.d.ts', format: 'typescript/module-declarations' }],
      },
      json: {
        transforms: ['attribute/cti', 'name/camel'],
        buildPath: 'tokens/',
        files: [
          {
            destination: 'tokens.json',
            format: 'json/flat',
          },
        ],
      },
      docs: {
        transforms: ['attribute/cti', 'name/kebab-with-digits'],
        buildPath: 'docs/',
        files: [{ destination: 'tokens.md', format: 'tokens/markdown' }],
      },
    },
  });

  const bar = createProgressBar(4);
  sd.buildPlatform('css');
  bar.update(1);
  sd.buildPlatform('js');
  bar.update(2);
  sd.buildPlatform('json');
  bar.update(3);
  sd.buildPlatform('docs');
  bar.update(4);
  stopBars();

  const tokensPath = path.resolve(__dirname, '../tokens/tokens.css');
  await applyAuroraColorMixOverrides(tokensPath);

  const motionTokenNames = ['glowPulse', 'glitchRgbShift', 'glitchScanline'];
  const baseMotionTokens = Object.fromEntries(
    motionTokenNames
      .map((name) => {
        const entry = tokens[name];
        if (!entry) {
          return undefined;
        }
        return [toKebabCase(name), entry.value];
      })
      .filter((entry): entry is [string, string] => Boolean(entry)),
  );

  const reducedMotionTokens: Record<string, string> = {
    'glitch-scanline': 'none',
    'glitch-rgb-shift': 'none',
    'glow-pulse': 'none',
  };

  await applyMotionOverrides(tokensPath, baseMotionTokens, reducedMotionTokens);
}

buildTokens();

const AURORA_SUPPORT_BLOCK = `@supports (color: color-mix(in oklab, white, black)) {
  :root {
    --aurora-g-light: color-mix(in oklab, hsl(var(--accent-2)) 37.5%, white);
    --aurora-g-light-color: var(--aurora-g-light);
    --aurora-p-light: color-mix(in oklab, hsl(var(--accent-1)) 37.5%, white);
    --aurora-p-light-color: var(--aurora-p-light);
  }
}`;

const AURORA_SUPPORT_REGEX =
  /@supports \(color: color-mix\(in oklab, white, black\)\) {\s*:root {\s*[\s\S]*?}\s*}\s*/g;

const MOTION_NO_PREFERENCE_REGEX =
  /@media \(prefers-reduced-motion: no-preference\) {\s*:root {\s*(?:--[a-z0-9-]+: [^;]+;\s*)+}\s*}\s*/gi;

const MOTION_REDUCED_REGEX =
  /@media \(prefers-reduced-motion: reduce\) {\s*:root {\s*(?:--[a-z0-9-]+: [^;]+;\s*)+}\s*}\s*/gi;

async function readCssWithRetry(filePath: string): Promise<string> {
  const attempts = 5;
  for (let index = 0; index < attempts; index += 1) {
    const css = await fs.readFile(filePath, 'utf8');
    if (css.trim().length > 0) {
      return css;
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  return fs.readFile(filePath, 'utf8');
}

async function applyAuroraColorMixOverrides(filePath: string): Promise<void> {
  const css = await readCssWithRetry(filePath);
  const stripped = css.replace(AURORA_SUPPORT_REGEX, '').trimEnd();
  const baseCss = stripped.length > 0 ? stripped : css.trimEnd();
  const content = `${baseCss}\n\n${AURORA_SUPPORT_BLOCK}\n`;
  await fs.writeFile(filePath, content);
}

async function applyMotionOverrides(
  filePath: string,
  baseTokens: Record<string, string>,
  reducedTokens: Record<string, string>,
): Promise<void> {
  const css = await readCssWithRetry(filePath);
  const sanitized = css
    .replace(MOTION_NO_PREFERENCE_REGEX, '')
    .replace(MOTION_REDUCED_REGEX, '')
    .trimEnd();

  const baseEntries = Object.keys(reducedTokens)
    .map((name) => {
      const value = baseTokens[name];
      if (!value) {
        return undefined;
      }
      return `    --${name}: ${value};`;
    })
    .filter((entry): entry is string => Boolean(entry));

  const reducedEntries = Object.entries(reducedTokens).map(
    ([name, value]) => `    --${name}: ${value};`,
  );

  if (baseEntries.length === 0 || reducedEntries.length === 0) {
    await fs.writeFile(filePath, `${sanitized}\n`);
    return;
  }

  const noPreferenceBlock = [
    '@media (prefers-reduced-motion: no-preference) {',
    '  :root {',
    ...baseEntries,
    '  }',
    '}',
  ].join('\n');

  const reducedBlock = [
    '@media (prefers-reduced-motion: reduce) {',
    '  :root {',
    ...reducedEntries,
    '  }',
    '}',
  ].join('\n');

  const content = `${sanitized}\n\n${noPreferenceBlock}\n\n${reducedBlock}\n`;
  await fs.writeFile(filePath, content);
}
