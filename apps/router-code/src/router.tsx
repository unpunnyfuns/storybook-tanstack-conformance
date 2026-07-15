import { Link, Outlet, createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { items } from "./data";

// The entire route tree is configured in code: no file conventions, no
// generated tree. This is the app under test.

export const rootRoute = createRootRoute({
  component: () => (
    <div>
      <nav>
        <Link to="/">Home</Link>{" "}
        <Link to="/widgets" search={{ sort: "asc" }}>
          Widgets
        </Link>{" "}
        <Link to="/widgets/$widgetId" params={{ widgetId: "1" }} search={{ zoom: false }}>
          Widget 1
        </Link>
      </nav>
      <Outlet />
    </div>
  ),
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
  component: () => (
    <div>
      <h1>Code-based routing</h1>
      <p>Every route in this app is configured with createRoute().</p>
    </div>
  ),
});

// A pathless layout: identity comes from an explicit id, not a path.
export const shellRoute = createRoute({
  id: "shell",
  getParentRoute: () => rootRoute,
  beforeLoad: () => ({ shell: "ready" }),
  component: () => (
    <div>
      <p>shell layout</p>
      <Outlet />
    </div>
  ),
});

export const widgetsRoute = createRoute({
  path: "/widgets",
  getParentRoute: () => shellRoute,
  validateSearch: (search: Record<string, unknown>): { sort: "asc" | "desc" } => ({
    sort: search.sort === "desc" ? "desc" : "asc",
  }),
  loaderDeps: ({ search }) => ({ sort: search.sort }),
  loader: ({ deps }) => ({
    widgets: items.toSorted((a, b) =>
      deps.sort === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
    ),
  }),
  component: WidgetList,
});

export const widgetDetailRoute = createRoute({
  path: "/widgets/$widgetId",
  getParentRoute: () => shellRoute,
  validateSearch: (search: Record<string, unknown>): { zoom: boolean } => ({
    zoom: search.zoom === true || search.zoom === "true",
  }),
  loader: ({ params }) => {
    const item = items.find((candidate) => candidate.id === params.widgetId);
    if (!item) {
      throw new Error(`No widget with id ${params.widgetId}`);
    }
    return { item };
  },
  component: WidgetDetail,
});

function WidgetList() {
  const { widgets } = widgetsRoute.useLoaderData();
  const { sort } = widgetsRoute.useSearch();
  return (
    <div>
      <h1>Widgets</h1>
      <p>sort: {sort}</p>
      <ul>
        {widgets.map((widget) => (
          <li key={widget.id}>{widget.name}</li>
        ))}
      </ul>
    </div>
  );
}

function WidgetDetail() {
  const { item } = widgetDetailRoute.useLoaderData();
  const { zoom } = widgetDetailRoute.useSearch();
  const { shell } = widgetDetailRoute.useRouteContext();
  return (
    <div>
      <h1>{item.name}</h1>
      <p>stock: {item.stock}</p>
      <p>zoom: {String(zoom)}</p>
      <p>shell: {shell}</p>
    </div>
  );
}

export const routeTree = rootRoute.addChildren([
  indexRoute,
  shellRoute.addChildren([widgetsRoute, widgetDetailRoute]),
]);

export function getRouter() {
  return createRouter({ routeTree });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
