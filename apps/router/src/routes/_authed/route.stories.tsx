import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect } from "storybook/test";
import type { AuthStore } from "../../auth";
import { Route } from "./route";

const authedStore: AuthStore = {
  isAuthenticated: () => true,
  toggle: () => {},
  subscribe: () => () => {},
};

// The scenario from storybookjs/storybook#34942: a story bound directly to a
// pathless layout route. Expected: the layout renders (an empty outlet here)
// with its beforeLoad guard satisfied. With the pathless bug present, the
// story router cannot match the layout and renders the not-found fallback.
const meta = {
  parameters: {
    layout: "fullscreen",
    tanstack: {
      router: {
        route: Route,
        context: { auth: authedStore },
      },
    },
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof Route>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LayoutItself: Story = {
  play: async ({ canvasElement }) => {
    await expect(canvasElement.textContent).not.toMatch(/not found/iu);
  },
};
