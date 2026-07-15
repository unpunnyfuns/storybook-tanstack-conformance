import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { useParams } from "@tanstack/react-router";
import { expect } from "storybook/test";
import { routeTree } from "./routeTree.gen";

/**
 * Tree mode against the app's generated file-based tree: the story component
 * is injected at the leaf selected by `path` (and `params`), replacing that
 * route's component while the rest of the tree stays real.
 */

function InjectedProbe() {
  const params = useParams({ strict: false }) as { userId?: string };
  return <p>injected probe{params.userId ? ` for user ${params.userId}` : ""}</p>;
}

const meta = {
  component: InjectedProbe,
  parameters: { layout: "fullscreen" },
  tags: ["ai-generated"],
} satisfies Meta<typeof InjectedProbe>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Inject at a flat route selected by path. */
export const AtFlatRoute: Story = {
  parameters: {
    tanstack: { router: { route: routeTree, path: "/about" } },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("injected probe")).toBeVisible();
  },
};

/** Inject at a param route selected by concrete path + params. */
export const AtParamRoute: Story = {
  parameters: {
    tanstack: {
      router: {
        route: routeTree,
        path: "/users/1" as never,
        params: { userId: "1" } as never,
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("injected probe for user 1")).toBeVisible();
  },
};
