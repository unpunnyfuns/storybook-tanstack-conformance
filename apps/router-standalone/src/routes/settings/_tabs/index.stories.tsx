import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect } from "storybook/test";
import { Route } from "./index";

// The one place in this suite where a gauge deliberately does NOT assert what
// the real app does. The e2e twin proves the app renders this index inside its
// `_tabs` layout, with that layout's `beforeLoad` context. This app turns the
// route tree connection off, and the layout's component and `beforeLoad` live
// in `_tabs/route.tsx`, a module only the generated tree imports. Nothing can
// render a component that was never loaded, so the layout is not missing by
// mistake: it is the price of `generatedRouteTree: false`, and these gauges
// pin that price so a change to it shows up as a diff.
//
// The pair still differs by one character, the trailing slash on `path`. A real
// app serves both URLs; so should the framework, opt-out or not.
const meta = {
  parameters: {
    layout: "fullscreen",
    tanstack: { router: { route: Route } },
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof Route>;

export default meta;
type Story = StoryObj<typeof meta>;

async function expectTheOrphanedIndex(canvas: Parameters<NonNullable<Story["play"]>>[0]["canvas"]) {
  // The index itself mounts and renders. On main and next this throws
  // `Duplicate routes found with id: /settings/_tabs/` instead, so this line is
  // the difference between degrading and crashing.
  await expect(await canvas.findByRole("heading", { name: "General" })).toBeVisible();
  // No parent chain, so no layout chrome.
  await expect(canvas.queryByText(/Tabs layout/u)).toBeNull();
  // The context the layout's `beforeLoad` would have supplied is absent, so the
  // tab renders its label with nothing in it.
  await expect(canvas.getByText(/Tab of:/u).textContent).not.toContain("Settings");
}

export const AtTheAncestorUrl: Story = {
  parameters: { tanstack: { router: { route: Route, path: "/settings" } } },
  play: async ({ canvas }) => {
    await expectTheOrphanedIndex(canvas);
  },
};

export const AtTheTrailingSlashUrl: Story = {
  parameters: { tanstack: { router: { route: Route, path: "/settings/" } } },
  play: async ({ canvas }) => {
    await expectTheOrphanedIndex(canvas);
  },
};
