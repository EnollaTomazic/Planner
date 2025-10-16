const path = require('node:path');

let mergeConfig = null;

const resolveMergeConfig = async () => {
  if (mergeConfig) {
    return mergeConfig;
  }

  const vite = await import('vite');
  mergeConfig = vite.mergeConfig;
  return mergeConfig;
};

try {
  ({ mergeConfig } = require('vite'));
} catch (error) {
  // Fall back to the dynamic import defined in resolveMergeConfig when require fails.
}

/** @type {import('@storybook/react-vite').StorybookConfig} */
const config = {
  stories: ['./src/components/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    const merge = mergeConfig ?? (await resolveMergeConfig());

    return merge(config, {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '../src'),
          '@env': path.resolve(__dirname, '../env'),
        },
      },
    });
  },
};

module.exports = config;
