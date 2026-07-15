import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect, type Mock } from "storybook/test";
import { items } from "../data";
import { listItems } from "../server-functions";
import { Route } from "./index";

// Server-function handlers never run in stories: the framework strips them
// from the client bundle (like Start itself does) and exports each server
// function as a spy. Stories provide results in `beforeEach`, which runs
// after the automatic mock reset.
const meta = {
  parameters: {
    layout: "fullscreen",
    tanstack: { router: { route: Route, path: "/" } },
  },
  beforeEach() {
    (listItems as unknown as Mock).mockResolvedValue(items);
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof Route>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Inventory" })).toBeVisible();
    await expect(canvas.getByText(/Widget: 12 in stock/u)).toBeVisible();
    await expect(listItems).toHaveBeenCalled();
  },
};

/** Per-story server state: the same route with an empty inventory. */
export const Empty: Story = {
  beforeEach() {
    (listItems as unknown as Mock).mockResolvedValue([]);
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Inventory" })).toBeVisible();
    await expect(canvas.queryByText(/in stock/u)).not.toBeInTheDocument();
  },
};
