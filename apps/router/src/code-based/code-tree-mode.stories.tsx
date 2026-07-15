import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { useParams } from "@tanstack/react-router";
import { expect } from "storybook/test";
import { codeTree } from "./tree";

/**
 * Tree mode with the code-based tree: the whole tree is passed and the story
 * component is injected at the leaf selected by path + params.
 */

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

/** Pass the whole code-based tree, select the leaf by path + params. */
export const TreeModeByPath: Story = {
  parameters: {
    tanstack: {
      router: {
        route: codeTree,
        path: "/widgets/7" as never,
        params: { widgetId: "7" } as never,
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("probe: widget 7")).toBeVisible();
    await expect(canvas.getByText("shell layout")).toBeVisible();
  },
};
