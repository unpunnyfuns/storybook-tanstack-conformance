import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect } from "storybook/test";
import { widgetDetailRoute, widgetsRoute } from "./router";

// Stories bound to routes from the real code-based app tree.

const meta = {
  parameters: { layout: "fullscreen" },
  tags: ["ai-generated"],
} satisfies Meta<typeof widgetsRoute>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Loader + validateSearch + loaderDeps on a route under an id-only layout. */
export const WidgetListSorted: Story = {
  parameters: {
    tanstack: {
      router: { route: widgetsRoute, path: "/widgets" as never, query: { sort: "desc" } },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Widgets" })).toBeVisible();
    await expect(canvas.getByText("sort: desc")).toBeVisible();
    const names = canvas.getAllByRole("listitem").map((li) => li.textContent);
    await expect(names.join(",")).toBe("Widget,Gizmo,Gadget");
  },
};

/** Params + search + beforeLoad context from the id-only shell layout. */
export const WidgetDetail: Story = {
  parameters: {
    tanstack: {
      router: {
        route: widgetDetailRoute,
        path: "/widgets/$widgetId" as never,
        params: { widgetId: "3" } as never,
        query: { zoom: "true" },
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Gizmo" })).toBeVisible();
    await expect(canvas.getByText("zoom: true")).toBeVisible();
    await expect(canvas.getByText("shell: ready")).toBeVisible();
    await expect(canvas.getByText("shell layout")).toBeVisible();
  },
};

/** Loader error surfaces in the default error boundary. */
export const UnknownWidget: Story = {
  parameters: {
    tanstack: {
      router: {
        route: widgetDetailRoute,
        path: "/widgets/$widgetId" as never,
        params: { widgetId: "999" } as never,
      },
    },
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.textContent).toMatch(/No widget with id 999/u);
  },
};
