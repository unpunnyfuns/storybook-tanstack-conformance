import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect } from "storybook/test";
import { Route } from "./panel";

// A pathless layout declared through the virtual route config
// (layout("gated", ...) in src/routes.ts).
const meta = {
  parameters: {
    layout: "fullscreen",
    tanstack: { router: { route: Route, path: "/panel" } },
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof Route>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Panel" })).toBeVisible();
    await expect(canvas.getByText(/Gate is open/u)).toBeVisible();
    await expect(canvas.getByText("gated layout (virtual)")).toBeVisible();
  },
};
