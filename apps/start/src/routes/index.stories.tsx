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

const nestingErrors: string[] = [];

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Inventory" })).toBeVisible();
    await expect(canvas.getByText(/Widget: 12 in stock/u)).toBeVisible();
    await expect(listItems).toHaveBeenCalled();
  },
};

/**
 * The root `shellComponent` is Start's document shell (`html`/`head`/`body`),
 * not app UI. Rendering it inside a story makes React log invalid-nesting
 * errors and hoists the shell's head content into the real document: the
 * story hijacks the page title and injects the app's meta tags.
 */
export const NoDocumentShellInStories: Story = {
  beforeEach() {
    const original = console.error;
    nestingErrors.length = 0;
    console.error = (...args: unknown[]) => {
      const message = args.map(String).join(" ");
      if (message.includes("cannot be a child of")) {
        nestingErrors.push(message);
      }
      original(...args);
    };
    return () => {
      console.error = original;
    };
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Inventory" })).toBeVisible();
    await expect(document.title).not.toBe("TanStack Start conformance app");
    await expect(nestingErrors).toEqual([]);
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
