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

/** The route-level errorComponent catches the loader error. */
export const ErrorBoundary: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Boom boundary" })).toBeVisible();
    await expect(
      canvas.getByText(/Intentional error to exercise the error boundary/u),
    ).toBeVisible();
  },
};
