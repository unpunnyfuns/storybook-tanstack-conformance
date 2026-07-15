import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect, type Mock } from "storybook/test";
import { items } from "../data";
import { getItem } from "../server-functions";
import { Route } from "./item";

// Virtual route config + Start server function in the loader.
const meta = {
  parameters: {
    tanstack: { router: { route: Route, path: "/items/$itemId", params: { itemId: "3" } } },
    layout: "fullscreen",
  },
  beforeEach() {
    (getItem as unknown as Mock).mockImplementation(({ data }: { data: string }) =>
      Promise.resolve(items.find((candidate) => candidate.id === data)),
    );
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof Route>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Gizmo" })).toBeVisible();
    await expect(canvas.getByText("Stock: 4")).toBeVisible();
  },
};
