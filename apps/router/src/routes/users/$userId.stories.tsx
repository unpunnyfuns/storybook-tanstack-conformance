import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect } from "storybook/test";
import { Route } from "./$userId";

const meta = {
  parameters: {
    layout: "fullscreen",
    tanstack: { router: { route: Route, path: "/users/$userId", params: { userId: "1" } } },
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof Route>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Ada Lovelace" })).toBeVisible();
  },
};

/**
 * A `routeOverrides` component override on the story-bound route itself must
 * win over the injected story component. The override lookup is keyed by the
 * original route id, which is not readable from a cloned leaf's `id` getter.
 */
export const ComponentOverrideOnBoundRoute: Story = {
  parameters: {
    tanstack: {
      router: {
        routeOverrides: {
          "/users/$userId": {
            component: () => <p>component override rendered</p>,
          },
        },
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("component override rendered")).toBeVisible();
  },
};

export const MockedLoader: Story = {
  parameters: {
    tanstack: {
      router: {
        routeOverrides: {
          "/users/$userId": {
            loader: () => ({
              user: { id: "1", name: "Mock User", email: "mock@example.com", role: "member" },
            }),
          },
        },
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Mock User" })).toBeVisible();
  },
};

export const NotFound: Story = {
  parameters: {
    tanstack: {
      router: { route: Route, path: "/users/$userId", params: { userId: "999" } as never },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "404" })).toBeVisible();
  },
};
