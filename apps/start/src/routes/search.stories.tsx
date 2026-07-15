import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect } from "storybook/test";
import { Route } from "./search";

const meta = {
  parameters: {
    layout: "fullscreen",
    tanstack: { router: { route: Route, path: "/search" } },
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof Route>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Empty query: every post matches. */
export const Empty: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("Results: 23")).toBeVisible();
  },
};

/** `query` drives `loaderDeps` drives the loader. */
export const WithQuery: Story = {
  parameters: {
    tanstack: { router: { query: { q: "post 2" } } },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("Results: 5")).toBeVisible();
  },
};
