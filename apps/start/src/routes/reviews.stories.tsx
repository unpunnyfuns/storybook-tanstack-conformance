import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect } from "storybook/test";
import { authStore } from "../auth";
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

/**
 * Per-story isolated QueryClient via `useRouterContext`: a story loader
 * creates and seeds a fresh client, the router context and the provider both
 * read it from `storyContext.loaded`. The shared preview client is bypassed.
 */
export const IsolatedClient: Story = {
  loaders: [
    () => {
      const isolatedClient = new QueryClient({
        defaultOptions: { queries: { retry: false, staleTime: Infinity } },
      });
      isolatedClient.setQueryData(
        ["reviews"],
        [{ id: "42", author: "Lin", text: "Isolated cache." }],
      );
      return { isolatedClient };
    },
  ],
  parameters: {
    tanstack: {
      router: {
        useRouterContext: ({ storyContext }) => ({
          auth: authStore,
          queryClient: (storyContext.loaded as { isolatedClient: QueryClient }).isolatedClient,
        }),
      },
    },
  },
  decorators: [
    (Story, context) => (
      <QueryClientProvider
        client={(context.loaded as { isolatedClient: QueryClient }).isolatedClient}
      >
        <Story />
      </QueryClientProvider>
    ),
  ],
  play: async ({ canvas }) => {
    await expect(await canvas.findByText(/Lin: Isolated cache/u)).toBeVisible();
    await expect(canvas.queryByText(/Ada: Solid routing/u)).not.toBeInTheDocument();
  },
};
