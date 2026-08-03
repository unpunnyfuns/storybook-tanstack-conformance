import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect, type Mock, userEvent } from "storybook/test";
import { tracked } from "../server-probe-fns";
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

/** A handler returning a Response is handed back raw, not serialized. */
export const ResponseReturn: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "respond" }));
    await expect(await canvas.findByText("raw: raw body")).toBeVisible();
  },
};

/**
 * Not a gauge: the supported way to stand in for a server function. It exists
 * so the story after it starts from an overridden mock, which Storybook's
 * automatic reset has to undo.
 */
export const TrackedOverridden: Story = {
  beforeEach() {
    (tracked as unknown as Mock).mockResolvedValue("mocked");
  },
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "tracked" }));
    await expect(await canvas.findByText(/traced: mocked/u)).toBeVisible();
  },
};

/**
 * In the real app every call runs the whole chain, every time. The story
 * before this one overrode `tracked`, so Storybook's automatic reset runs in
 * between; an unmocked call after it must still run the client middleware and
 * reach the handler, not return the previous story's value and not return
 * undefined.
 */
export const ChainSurvivesMockReset: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "tracked" }));
    await expect(await canvas.findByText("traced: tracked ok with client phase")).toBeVisible();
  },
};
