import preview from "#.storybook/preview";
import { expect } from "storybook/test";
import { Route } from "./about";

const meta = preview.meta({
  parameters: {
    layout: "fullscreen",
    tanstack: { router: { route: Route } },
  },
  tags: ["ai-generated"],
});

export const Default = meta.story({
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "About" })).toBeVisible();
  },
});
