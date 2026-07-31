import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect } from "storybook/test";
import { Route } from "./index";

// A page story bound to the index of a root-level pathless layout, imported
// straight from its route file. Without the generated tree connected this route
// arrives with no path, no id and no parent, and the framework throws
// `Duplicate routes found with id: /_app/` before rendering.
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
    await expect(await canvas.findByRole("heading", { name: "Shell Home" })).toBeVisible();
    // The context comes from the shell layout's beforeLoad, so this asserts the
    // story mounted INSIDE the layout rather than merely rendering standalone.
    await expect(canvas.getByText(/Inside of:/u).textContent).toContain("App Shell");
  },
};
