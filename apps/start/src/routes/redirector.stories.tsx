import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect, userEvent } from "storybook/test";
import { Route } from "./redirector";

/**
 * A thrown redirect from a server fn must navigate, not reject unhandled.
 *
 * `navigate: true` because the route redirects to itself with a search flag and
 * reads it back, so the gauge only turns green if navigation really happens.
 */
const meta = {
  parameters: {
    layout: "fullscreen",
    tanstack: { router: { route: Route, path: "/redirector", navigate: true } },
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof Route>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RedirectNavigates: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("done: no")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "log in" }));
    await expect(await canvas.findByText("done: yes")).toBeVisible();
  },
};
