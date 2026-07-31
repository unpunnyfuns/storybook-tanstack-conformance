import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect } from "storybook/test";
import { Route } from "./login";

const meta = {
  parameters: {
    layout: "fullscreen",
    tanstack: { router: { route: Route } },
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof Route>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Log in" })).toBeVisible();
    await expect(canvas.queryByText(/Shell layout/u)).toBeNull();
  },
};
