import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { authStore } from "./auth";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const queryClient = new QueryClient();
  return createRouter({
    routeTree,
    context: { auth: authStore, queryClient },
    defaultPreload: "intent",
    scrollRestoration: true,
    Wrap: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
