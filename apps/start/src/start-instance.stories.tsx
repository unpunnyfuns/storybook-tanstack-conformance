import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { createStart } from "@tanstack/react-start";
import { expect } from "storybook/test";

/**
 * createStart() must return a start instance ({ getOptions, createMiddleware }).
 * Kept out of the route tree on purpose: if the mock crashes here it fails
 * only this file. No e2e twin; the contract is the package's own typed API.
 */
const startInstance = createStart(() => ({}));

function StartInstanceProbe() {
  const keys = Object.keys(startInstance).toSorted().join(", ");
  return <p>instance keys: {keys || "none"}</p>;
}

const meta = {
  component: StartInstanceProbe,
  parameters: { layout: "fullscreen" },
  tags: ["ai-generated"],
} satisfies Meta<typeof StartInstanceProbe>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InstanceShape: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByText(/createMiddleware/u)).toBeVisible();
  },
};

export const GlobalMiddlewareSetup: Story = {
  play: async () => {
    const middleware = startInstance.createMiddleware({ type: "function" });
    await expect(typeof middleware.server).toBe("function");
  },
};
