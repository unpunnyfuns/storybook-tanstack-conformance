import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect } from "storybook/test";
import { Route } from "./boom";

const meta = {
  parameters: {
    layout: "fullscreen",
    tanstack: { router: { route: Route, path: "/boom" } },
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof Route>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ErrorBoundary: Story = {
  play: async ({ canvasElement }) => {
    await expect(canvasElement.textContent).toMatch(
      /Intentional error to exercise the error boundary/u,
    );
  },
};
