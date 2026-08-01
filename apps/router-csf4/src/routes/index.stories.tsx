import preview from "#.storybook/preview";
import { expect } from "storybook/test";
import { Route } from "./index";

// CSF factories: the meta comes from `preview.meta()` and stories from
// `meta.story()`, with no default export. Importing the preview from
// `#.storybook/preview` is what the CSF factory codemod generates.
const meta = preview.meta({
  parameters: {
    layout: "fullscreen",
    tanstack: { router: { route: Route, path: "/" } },
  },
  tags: ["ai-generated"],
});

export const Default = meta.story({
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByRole("heading", { name: "CSF Factories Harness" }),
    ).toBeVisible();
  },
});
