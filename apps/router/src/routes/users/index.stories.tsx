import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect } from "storybook/test";
import { Route } from "./index";

const meta = {
  parameters: {
    layout: "fullscreen",
    tanstack: { router: { route: Route, path: "/users/" } },
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof Route>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Ada Lovelace" })).toBeVisible();
  },
};

/**
 * Links must render the same href a real router would produce: path params
 * interpolated into the URL, router-only props (like `params`) consumed by
 * the component instead of leaking onto the DOM element.
 */
export const LinkHrefs: Story = {
  play: async ({ canvas }) => {
    const userLink = await canvas.findByRole("link", { name: "Ada Lovelace" });
    await expect(userLink).toHaveAttribute("href", "/users/1");
    await expect(userLink).not.toHaveAttribute("params");

    const splatLink = await canvas.findByRole("link", { name: "Files" });
    await expect(splatLink).toHaveAttribute("href", "/files/reports/2026/q2.pdf");
    await expect(splatLink).not.toHaveAttribute("params");
  },
};

/**
 * A `Link` carrying its own `onClick` (analytics, closing a menu, etc.) must
 * still fire that handler. The mock replaces navigation with a spy but has to
 * keep the caller's handler, and run it on every click, exactly as the real
 * router does.
 */
export const LinkOnClickRuns: Story = {
  play: async ({ canvas, userEvent }) => {
    const link = await canvas.findByTestId("tracked-link");
    await userEvent.click(link);
    await expect(await canvas.findByTestId("tracked-count")).toHaveTextContent("onClick ran 1x");

    await userEvent.click(link);
    await expect(await canvas.findByTestId("tracked-count")).toHaveTextContent("onClick ran 2x");
  },
};
