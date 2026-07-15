import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect } from "storybook/test";
import { Route } from "./route";

// A story bound directly to a pathless layout that already HAS an index
// child: the framework should mount through the existing index route, not a
// synthetic one, so the General tab renders inside the layout.
const meta = {
  parameters: {
    layout: "fullscreen",
    tanstack: { router: { route: Route } },
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof Route>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LayoutWithIndexChild: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "General" })).toBeVisible();
  },
};
