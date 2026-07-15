import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect } from "storybook/test";
import { Route } from "./$";

const meta = {
  parameters: {
    layout: "fullscreen",
    tanstack: {
      router: {
        route: Route,
        path: "/files/$",
        params: { _splat: "reports/2026/q2.pdf" },
      },
    },
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof Route>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("reports/2026/q2.pdf")).toBeVisible();
  },
};
