import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect, type Mock } from "storybook/test";
import { items } from "../../data";
import { getItem } from "../../server-functions";
import { Route } from "./$itemId";

const meta = {
  parameters: {
    layout: "fullscreen",
    tanstack: { router: { route: Route, path: "/items/$itemId", params: { itemId: "3" } } },
  },
  beforeEach() {
    (getItem as unknown as Mock).mockImplementation(({ data }: { data: string }) => {
      const item = items.find((candidate) => candidate.id === data);
      if (!item) {
        throw new Error(`No item with id ${data}`);
      }
      return Promise.resolve(item);
    });
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof Route>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Param route whose loader calls a server function; the story mocks it. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Gizmo" })).toBeVisible();
    await expect(canvas.getByText("Stock: 4")).toBeVisible();
  },
};
