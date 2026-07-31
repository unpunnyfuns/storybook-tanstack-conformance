import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Preview } from "@storybook/tanstack-react";
import { authStore } from "../src/auth";
// Load-bearing: running routeTree.gen is what gives every file route its path,
// id and parent. The app does this from src/main.tsx, which Storybook never
// loads, so without this import stories receive routes with no context. Not a
// stray import, do not remove.
import "../src/routeTree.gen";
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

const preview: Preview = {
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
