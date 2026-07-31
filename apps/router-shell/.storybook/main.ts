import type { StorybookConfig } from "@storybook/tanstack-react";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-vitest"],
  framework: "@storybook/tanstack-react",
};
export default config;
