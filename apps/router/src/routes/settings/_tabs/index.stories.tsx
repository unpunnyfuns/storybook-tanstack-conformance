import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect } from "storybook/test";
import { Route } from "./index";

const meta = {
  parameters: {
    layout: "fullscreen",
    tanstack: { router: { route: Route, path: "/settings/" } },
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof Route>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "General" })).toBeVisible();
    await expect(canvas.getByText(/Tab of:/u).textContent).toContain("Settings");
  },
};
