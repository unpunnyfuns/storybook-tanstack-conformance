import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect, userEvent } from "storybook/test";
import { NavProbePage } from "./routes/nav-probe";
import { routeTree } from "./routeTree.gen";

/**
 * Navigation gauges in tree mode: the story mounts the whole app tree at
 * /nav-probe, so /nav-target exists and every trigger has somewhere to go.
 *
 * The story component is the route's own page component on purpose. Tree mode
 * replaces the selected leaf's component with the story's, so a placeholder
 * here would blank the very triggers these gauges click.
 * Real-app proof lives in e2e/router.spec.ts.
 *
 * `navigate: true` because these gauges assert the real app's navigation: each
 * one clicks a trigger and looks for the target page. The framework's default
 * records the attempt and stays put, which is the right default for a story
 * about one screen, so gauges like these opt in.
 */
const meta = {
  component: NavProbePage,
  parameters: {
    layout: "fullscreen",
    tanstack: { router: { route: routeTree, path: "/nav-probe", navigate: true } },
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof NavProbePage>;

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
