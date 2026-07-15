import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect } from "storybook/test";
import { Route } from "./panel";

// A pathless layout declared through the virtual route config
// (layout("gated", ...) in src/routes.ts).
const meta = {
  parameters: {
    layout: "fullscreen",
    tanstack: { router: { route: Route, path: "/panel" } },
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof Route>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Panel" })).toBeVisible();
    await expect(canvas.getByText(/Gate is open/u)).toBeVisible();
    await expect(canvas.getByText("gated layout (virtual)")).toBeVisible();
  },
};

const nestingErrors: string[] = [];

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
    await expect(await canvas.findByRole("heading", { name: "Panel" })).toBeVisible();
    await expect(document.title).not.toBe("Start virtual-routes conformance app");
    await expect(nestingErrors).toEqual([]);
  },
};
