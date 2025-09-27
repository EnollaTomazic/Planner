type StorybookConfig = {
  stories: string[];
  framework: {
    name: string;
    options?: Record<string, unknown>;
  };
};

const config: StorybookConfig = {
  stories: ["./src/components/**/*.stories.@(js|jsx|ts|tsx|mdx)"],
  framework: {
    name: "@storybook/react-vite",
  },
};

export default config;
