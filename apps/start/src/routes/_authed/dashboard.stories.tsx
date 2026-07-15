import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect } from "storybook/test";
import type { AuthStore } from "../../auth";
import { Route } from "./dashboard";

const authedStore: AuthStore = {
  isAuthenticated: () => true,
  toggle: () => {},
  subscribe: () => () => {},
};

const meta = {
  parameters: {
    layout: "fullscreen",
    tanstack: {
      router: {
        route: Route,
        // The app serves this page at /dashboard; the `_authed` segment is a
        // pathless layout and never appears in the URL. With the pathless bug
        // present, this story only renders when given the non-URL workaround
        // path "/_authed/dashboard" instead.
        path: "/dashboard",
        context: { auth: authedStore },
        routeOverrides: { "/_authed": { beforeLoad: () => {} } },
      },
    },
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof Route>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Authenticated: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(canvas.getByText(/Authenticated \(from route context\): true/u)).toBeVisible();
  },
};
