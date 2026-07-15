import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { useLocation, useSearch } from "@tanstack/react-router";
import { expect } from "storybook/test";

/**
 * Router parameters with a non-Route component: `route` is a plain options
 * object (no Route instance anywhere), so the framework builds a synthetic
 * route to host the story.
 */

function RouteProbe() {
  const search = useSearch({ strict: false }) as { view?: string };
  const location = useLocation();
  return (
    <div>
      <p>view: {search.view ?? "none"}</p>
      <p>hash: {location.hash || "none"}</p>
      <p>path: {location.pathname}</p>
    </div>
  );
}

const meta = {
  component: RouteProbe,
  parameters: { layout: "fullscreen" },
  tags: ["ai-generated"],
} satisfies Meta<typeof RouteProbe>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Synthetic route from plain options, with search params. */
export const SyntheticRoute: Story = {
  parameters: {
    tanstack: {
      router: {
        route: { path: "/demo/form/address" },
        query: { view: "list" },
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("view: list")).toBeVisible();
    await expect(canvas.getByText("path: /demo/form/address")).toBeVisible();
  },
};

/** URL fragment (hash) provided through `path`. */
export const WithHash: Story = {
  parameters: {
    tanstack: {
      router: {
        route: { path: "/guide" },
        path: "/guide#install" as never,
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText(/hash: install/u)).toBeVisible();
  },
};
