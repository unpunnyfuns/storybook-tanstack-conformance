import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect, type Mock } from "storybook/test";
import { items } from "./data";
import { indexRoute, itemRoute } from "./router";
import { getItem, listItems } from "./server-functions";

// Code-based Start routes: server functions in loaders, mocked per story.

const meta = {
  parameters: { layout: "fullscreen" },
  tags: ["ai-generated"],
} satisfies Meta<typeof indexRoute>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inventory: Story = {
  parameters: {
    tanstack: { router: { route: indexRoute, path: "/" as never } },
  },
  beforeEach() {
    (listItems as unknown as Mock).mockResolvedValue(items);
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Inventory" })).toBeVisible();
    await expect(canvas.getByText(/Widget: 12 in stock/u)).toBeVisible();
  },
};

export const ItemDetail: Story = {
  parameters: {
    tanstack: {
      router: {
        route: itemRoute,
        path: "/items/$itemId" as never,
        params: { itemId: "3" } as never,
      },
    },
  },
  beforeEach() {
    (getItem as unknown as Mock).mockImplementation(({ data }: { data: string }) =>
      Promise.resolve(items.find((candidate) => candidate.id === data)),
    );
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Gizmo" })).toBeVisible();
    await expect(canvas.getByText("Stock: 4")).toBeVisible();
  },
};
