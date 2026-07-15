import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect } from "storybook/test";
import { Route } from "./index";

const meta = {
  parameters: {
    layout: "fullscreen",
    tanstack: { router: { route: Route, path: "/posts/" } },
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof Route>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllPosts: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: "Posts", level: 1 })).toBeVisible();
  },
};

export const FilteredByNews: Story = {
  parameters: {
    tanstack: { router: { route: Route, query: { tag: "news", page: "1", sort: "newest" } } },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/Total matching: 8/u)).toBeVisible();
  },
};
