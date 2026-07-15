import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect } from "storybook/test";
import { Route } from "./index";

const meta = {
  parameters: {
    layout: "fullscreen",
    tanstack: { router: { route: Route, path: "/" } },
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof Route>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByRole("heading", { name: "TanStack Router Repro Harness" }),
    ).toBeVisible();
  },
};

export const RedirectedBanner: Story = {
  parameters: {
    tanstack: { router: { query: { redirectedFrom: "/dashboard" } } },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText(/Redirected here from/u)).toBeVisible();
  },
};
