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
