import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect } from "storybook/test";
import { Route } from "./$userId";

const meta = {
  parameters: {
    layout: "fullscreen",
    tanstack: { router: { route: Route, path: "/users/$userId", params: { userId: "1" } } },
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof Route>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Ada Lovelace" })).toBeVisible();
  },
};
