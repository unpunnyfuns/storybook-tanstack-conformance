import type { ReactNode } from "react";
import { HeadContent, Link, Scripts, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
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
          <Link to="/panel">Panel</Link>
        </nav>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
