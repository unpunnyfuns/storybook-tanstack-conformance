import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Preview } from "@storybook/tanstack-react";
import { sb } from "storybook/test";
import { authStore } from "../src/auth";
import "../src/routeTree.gen";
import "./preview.css";

// Replace the server-only db client with src/db/__mocks__/client.ts so the
// module graph stays browser-safe (the real module throws outside Node).
sb.mock(import("../src/db/client.ts"));

// One QueryClient shared by the router context and the React provider, per
// the framework docs: clear it between stories so each starts fresh.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
    },
  },
});

const preview: Preview = {
  beforeEach: () => {
    queryClient.clear();
  },
  parameters: {
    tanstack: {
      router: {
        context: { auth: authStore, queryClient },
      },
    },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};

export default preview;
