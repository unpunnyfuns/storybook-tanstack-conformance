import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect, userEvent } from "storybook/test";
import { Route } from "./server-probes";

/**
 * Gauges for server-function semantics. Each story asserts what the REAL app
 * does (proven by the matching tests in e2e/start.spec.ts). Failures here are
 * measurements of mock drift, not test bugs.
 */
const meta = {
  parameters: {
    layout: "fullscreen",
    tanstack: { router: { route: Route, path: "/server-probes" } },
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof Route>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Middleware server phase seeds context.user; the handler must see it. */
export const MiddlewareServerContext: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "who am i" }));
    await expect(await canvas.findByText("user: ada")).toBeVisible();
  },
};

/** The validator coerces "1" to 1 before the handler adds 1. */
export const ValidatorTransforms: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "increment" }));
    await expect(await canvas.findByText("sum: 2")).toBeVisible();
  },
};

/** setCookie writes the response; getCookie reads the request. No round trip. */
export const CookieScope: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "cookie echo" }));
    await expect(await canvas.findByText("cookie: unset")).toBeVisible();
  },
};

/** Middleware client phase runs in the browser. */
export const MiddlewareClientPhase: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "tracked" }));
    await expect(await canvas.findByText("traced: tracked ok with client phase")).toBeVisible();
  },
};
