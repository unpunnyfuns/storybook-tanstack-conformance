import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect } from "storybook/test";
import { Route } from "./audit";

// `_admin` is a second pathless layout beside `_authed`: sibling pathless
// layouts must not collide when the tree is duplicated.
const meta = {
  parameters: {
    layout: "fullscreen",
    tanstack: { router: { route: Route, path: "/audit" } },
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof Route>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Audit log" })).toBeVisible();
  },
};
