import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { definePreview } from "@storybook/tanstack-react";
import { authStore } from "../src/auth";
import { routeTree } from "../src/routeTree.gen";
import "../src/index.css";
import "./preview.css";

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

export default definePreview({
  beforeEach: () => {
    queryClient.clear();
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/iu,
        date: /Date$/iu,
      },
    },

    tanstack: {
      router: {
        route: routeTree,
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
});
