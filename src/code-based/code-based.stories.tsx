import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect } from "storybook/test";
import { widgetDetailRoute, widgetsRoute } from "./tree";

/**
 * Coverage for code-based (config) routes in bound mode: the story binds a
 * single createRoute() object and the route's own component renders.
 */

const meta = {
  parameters: { layout: "fullscreen" },
  tags: ["ai-generated"],
} satisfies Meta<typeof widgetsRoute>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A story bound to one code-based route; the loader-backed list renders. */
export const BoundRoute: Story = {
  parameters: {
    tanstack: { router: { route: widgetsRoute, path: "/widgets" as never } },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Widgets" })).toBeVisible();
    await expect(canvas.getByText("beta")).toBeVisible();
  },
};

/** A story bound to the code-based param route under the pathless shell layout. */
export const BoundParamRoute: Story = {
  parameters: {
    tanstack: {
      router: {
        route: widgetDetailRoute,
        path: "/widgets/$widgetId" as never,
        params: { widgetId: "7" } as never,
        query: { zoom: "true" },
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Widget 7" })).toBeVisible();
    await expect(canvas.getByText("zoom: true")).toBeVisible();
    await expect(canvas.getByText("shell layout")).toBeVisible();
  },
};
