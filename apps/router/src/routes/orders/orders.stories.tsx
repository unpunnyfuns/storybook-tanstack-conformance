import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect } from "storybook/test";
import { Route } from "./order-{$orderId}";

const meta = {
  parameters: {
    layout: "fullscreen",
    tanstack: {
      router: {
        route: Route,
        path: "/orders/order-{$orderId}" as never,
        params: { orderId: "42" } as never,
      },
    },
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof Route>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Param with a static prefix: `/orders/order-42` yields `orderId = 42`. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Order 42" })).toBeVisible();
  },
};
