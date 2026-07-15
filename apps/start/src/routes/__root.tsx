import type { ReactNode } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { HeadContent, Link, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import type { AuthStore } from "../auth";

export interface RouterContext {
  auth: AuthStore;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "TanStack Start conformance app" },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: () => (
    <div>
      <h1>404</h1>
      <p>No route matched.</p>
    </div>
  ),
});

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <nav>
          <Link to="/">Home</Link>{" "}
          <Link to="/items/$itemId" params={{ itemId: "1" }}>
            Item 1
          </Link>{" "}
          <Link to="/panel">Panel</Link> <Link to="/about">About</Link>{" "}
          <Link to="/users">Users</Link>{" "}
          <Link to="/posts" search={{ tag: "all", page: 1, sort: "newest" }}>
            Posts
          </Link>{" "}
          <Link to="/dashboard">Dashboard</Link> <Link to="/reviews">Reviews</Link>
        </nav>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
