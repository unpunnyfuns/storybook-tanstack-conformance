import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect } from "storybook/test";
import { Route } from "./index";

// The same pair as the layout index next door, on a route with no pathless
// layout in its chain. If these two agree while those two differ, the trailing
// slash is a pathless-layout problem; if both pairs differ the same way, it is
// a nested-index problem and the layout is a red herring.
const meta = {
  parameters: {
    layout: "fullscreen",
    tanstack: { router: { route: Route } },
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof Route>;

export default meta;
type Story = StoryObj<typeof meta>;

async function expectTheDocsIndex(canvas: Parameters<NonNullable<Story["play"]>>[0]["canvas"]) {
  await expect(await canvas.findByRole("heading", { name: "Docs Index" })).toBeVisible();
  await expect(canvas.getByText(/no pathless layout involved/u)).toBeVisible();
}

export const AtTheAncestorUrl: Story = {
  parameters: { tanstack: { router: { route: Route, path: "/docs" } } },
  play: async ({ canvas }) => {
    await expectTheDocsIndex(canvas);
  },
};

export const AtTheTrailingSlashUrl: Story = {
  parameters: { tanstack: { router: { route: Route, path: "/docs/" } } },
  play: async ({ canvas }) => {
    await expectTheDocsIndex(canvas);
  },
};
