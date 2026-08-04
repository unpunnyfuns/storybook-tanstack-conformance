import type { StorybookConfig } from "@storybook/tanstack-react";

// `generatedRouteTree: false` is the whole experiment. Every other file-based
// app in this suite reaches its stories with the generated tree connected,
// either by importing it from preview or by letting the framework find it.
// Turning the connection off is the supported escape hatch, and it leaves a
// file route carrying nothing but its own path, which is the shape the
// framework's own unit tests exercise and no gauge measured until now.
const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-vitest"],
  framework: {
    name: "@storybook/tanstack-react",
    options: { generatedRouteTree: false },
  },
};
export default config;
