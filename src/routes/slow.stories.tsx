import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect } from "storybook/test";
import { Route } from "./slow";

const meta = {
  parameters: {
    layout: "fullscreen",
    tanstack: { router: { route: Route, path: "/slow" } },
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof Route>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The 250ms loader resolves and the route content replaces the pending state. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("Answer: 42")).toBeVisible();
  },
};
