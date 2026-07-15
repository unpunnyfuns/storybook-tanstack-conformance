import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect } from "storybook/test";
import { Route } from "./{-$category}";

const meta = {
  parameters: {
    layout: "fullscreen",
    tanstack: { router: { route: Route, path: "/blog" as never } },
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof Route>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Optional param omitted: `/blog` matches with `category` undefined. */
export const WithoutCategory: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByText(/Category: all/u)).toBeVisible();
  },
};

/** Optional param provided via `params`. */
export const WithCategory: Story = {
  parameters: {
    tanstack: {
      router: {
        route: Route,
        path: "/blog/{-$category}" as never,
        params: { category: "guides" } as never,
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText(/Category: guides/u)).toBeVisible();
  },
};
