import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect, userEvent } from "storybook/test";
import { routeTree } from "./routeTree.gen";

/**
 * Navigation gauges in tree mode: the story mounts the whole app tree at
 * /nav-probe, so /nav-target exists and every trigger has somewhere to go.
 * Real-app proof lives in e2e/router.spec.ts.
 */
function NavigationGauge() {
  return null;
}

const meta = {
  component: NavigationGauge,
  parameters: {
    layout: "fullscreen",
    tanstack: { router: { route: routeTree, path: "/nav-probe" } },
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof NavigationGauge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ByLink: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole("link", { name: "by link" }));
    await expect(await canvas.findByRole("heading", { name: "Nav target" })).toBeVisible();
  },
};

export const ByHook: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "by hook" }));
    await expect(await canvas.findByRole("heading", { name: "Nav target" })).toBeVisible();
  },
};

export const ByComponent: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "by component" }));
    await expect(await canvas.findByRole("heading", { name: "Nav target" })).toBeVisible();
  },
};
