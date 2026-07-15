import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect } from "storybook/test";
import { Route } from "./index";

const meta = {
  parameters: {
    layout: "fullscreen",
    tanstack: { router: { route: Route, path: "/posts/$postId/", params: { postId: "1" } } },
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof Route>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Post 1" })).toBeVisible();
  },
};

export const Highlighted: Story = {
  parameters: {
    tanstack: {
      router: { query: { highlight: "true" } },
    },
  },
  play: async ({ canvas }) => {
    const heading = await canvas.findByRole("heading", { name: "Post 1" });
    await expect(getComputedStyle(heading).backgroundColor).toBe("rgb(255, 255, 0)");
  },
};
