import type { ReactNode } from "react";
import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { getItem, listItems } from "./server-functions";

// TanStack Start app with a code-based route tree: no file conventions, no
// generated tree, server functions in loaders, document shell on the root.

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
          </Link>
        </nav>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

export const rootRoute = createRootRoute({
  head: () => ({
    meta: [{ charSet: "utf-8" }, { title: "Start code-based conformance app" }],
  }),
  shellComponent: RootDocument,
  notFoundComponent: () => (
    <div>
      <h1>404</h1>
      <p>No route matched.</p>
    </div>
  ),
});

export const indexRoute = createRoute({
  path: "/",
  getParentRoute: () => rootRoute,
  loader: () => listItems(),
  component: Home,
});

export const itemRoute = createRoute({
  path: "/items/$itemId",
  getParentRoute: () => rootRoute,
  loader: ({ params }) => getItem({ data: params.itemId }),
  component: ItemDetail,
});

function Home() {
  const items = indexRoute.useLoaderData();
  return (
    <div>
      <h1>Inventory</h1>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.name}: {item.stock} in stock
          </li>
        ))}
      </ul>
    </div>
  );
}

function ItemDetail() {
  const item = itemRoute.useLoaderData();
  return (
    <div>
      <h1>{item.name}</h1>
      <p>Stock: {item.stock}</p>
    </div>
  );
}

export const routeTree = rootRoute.addChildren([indexRoute, itemRoute]);

export function getRouter() {
  return createRouter({ routeTree });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
