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

// `as never` because the `path` parameter is keyed by `FileRoutesByFullPath`,
// where a nested index is registered under its trailing-slash form only. The
// no-slash form is the `to` form, which is what TanStack asks for everywhere
// else (`<Link to="/docs">`), and which the e2e twin proves this app serves. So
// the URL is real and the app answers it; only the story parameter's type
// disagrees. The sibling settings story needs no cast, because its pathless
// layout contributes `/settings` as a full path in its own right.
export const AtTheAncestorUrl: Story = {
  parameters: { tanstack: { router: { route: Route, path: "/docs" as never } } },
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
