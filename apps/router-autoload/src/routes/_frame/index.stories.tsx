import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect } from "storybook/test";
import { Route } from "./index";

// The gauge for route-tree autoloading. The story binds the child route
// directly rather than the generated tree, and this app's preview does not
// import `routeTree.gen`, so the only way the assertions below can hold is if
// the framework located and ran the generated tree by itself.
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
    await expect(await canvas.findByRole("heading", { name: "Autoload Home" })).toBeVisible();
    // The layout's chrome proves the parent chain reached the story.
    await expect(canvas.getByText(/Frame layout/u)).toBeVisible();
    // The context proves the layout itself ran, not merely that something
    // rendered around the child.
    await expect(canvas.getByText(/Inside of:/u).textContent).toContain("Autoload Frame");
  },
};
