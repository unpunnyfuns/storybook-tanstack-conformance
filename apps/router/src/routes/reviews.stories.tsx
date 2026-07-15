import type { QueryClient } from "@tanstack/react-query";
import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect } from "storybook/test";
import { Route } from "./reviews";

const meta = {
  parameters: {
    layout: "fullscreen",
    tanstack: { router: { route: Route, path: "/reviews" } },
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof Route>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No seeding: the loader runs the real queryFn through the shared client. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByText(/Ada: Solid routing/u)).toBeVisible();
  },
};

/** Seeded cache: setQueryData in beforeEach; the queryFn never runs. */
export const Seeded: Story = {
  beforeEach: ({ parameters }) => {
    const queryClient: QueryClient | undefined = parameters.tanstack?.router?.context?.queryClient;
    queryClient?.setQueryData(["reviews"], [{ id: "9", author: "Grace", text: "Seeded review." }]);
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText(/Grace: Seeded review/u)).toBeVisible();
    await expect(canvas.queryByText(/Ada: Solid routing/u)).not.toBeInTheDocument();
  },
};
