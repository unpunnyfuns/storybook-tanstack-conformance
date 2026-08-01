import preview from "#.storybook/preview";
import { expect } from "storybook/test";
import { Route } from "./$userId";

const meta = preview.meta({
  parameters: {
    layout: "fullscreen",
    tanstack: { router: { route: Route, params: { userId: "2" } } },
  },
  tags: ["ai-generated"],
});

export const Default = meta.story({
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Grace Hopper" })).toBeVisible();
  },
});
