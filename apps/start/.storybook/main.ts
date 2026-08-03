import type { StorybookConfig } from "@storybook/tanstack-react";

/**
 * `executeServerFunctions` keeps server function handlers and middleware server
 * phases in the bundle instead of replacing them with no-op spies, which is what
 * lets the server-probe gauges measure the real chain rather than the strip.
 * Without it those gauges can only ever record `undefined`, so they would be red
 * on every channel forever and measure nothing about the framework.
 *
 * The cast is load-bearing across channels. The option ships in the patched
 * channel's framework only; `main` and `next` publish a `FrameworkOptions` with
 * just `builder`, so the object literal would fail their excess property check
 * and one config has to typecheck against all three.
 */
const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-vitest"],
  framework: {
    name: "@storybook/tanstack-react",
    options: { executeServerFunctions: true },
  } as StorybookConfig["framework"],
};
export default config;
