import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { useParams } from "@tanstack/react-router";
import { expect } from "storybook/test";
import { routeTree } from "./router";

// Tree mode and direct layout binding against the code-based app tree.

function TreeLeafProbe() {
  const params = useParams({ strict: false }) as { widgetId?: string };
  return <p>probe: widget {params.widgetId ?? "none"}</p>;
}

const meta = {
  component: TreeLeafProbe,
  parameters: { layout: "fullscreen" },
  tags: ["ai-generated"],
} satisfies Meta<typeof TreeLeafProbe>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Pass the whole tree; the leaf is selected by path + params. */
export const TreeModeByPath: Story = {
  parameters: {
    tanstack: {
      router: {
        route: routeTree,
        path: "/widgets/2" as never,
        params: { widgetId: "2" } as never,
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("probe: widget 2")).toBeVisible();
    await expect(canvas.getByText("shell layout")).toBeVisible();
  },
};
