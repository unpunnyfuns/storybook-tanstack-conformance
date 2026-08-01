import { defineMain } from "@storybook/tanstack-react/node";

// CSF factories throughout: `defineMain` here, `definePreview` in preview.tsx,
// `preview.meta()` / `meta.story()` in the stories. The preview file is what
// flips the Vite builder onto its CSF4 code path.
export default defineMain({
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-vitest"],
  framework: "@storybook/tanstack-react",
});
