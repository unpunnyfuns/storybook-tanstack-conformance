import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect } from "storybook/test";
import { Route } from "./_app";

// A story bound to the shell layout itself. The layout has an index child, so
// the framework should mount through that child rather than a synthetic one.
const meta = {
  parameters: {
    layout: "fullscreen",
    tanstack: { router: { route: Route } },
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof Route>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ShellWithIndexChild: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Shell Home" })).toBeVisible();
  },
};
