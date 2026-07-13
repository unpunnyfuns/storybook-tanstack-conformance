import { Outlet, createRootRoute, createRoute } from "@tanstack/react-router";

/**
 * A self-contained code-based (config) route tree, independent of the app's
 * file-based tree. Mirrors the same shapes: a pathless layout (id-only route),
 * a loader-backed list, and a param route with search validation.
 */

export const rootRoute = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: () => <p>code-based 404</p>,
});

export const shellRoute = createRoute({
  id: "shell",
  getParentRoute: () => rootRoute,
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
  loader: () => ({ widgets: ["alpha", "beta", "gamma"] }),
  component: WidgetList,
});

export const widgetDetailRoute = createRoute({
  path: "/widgets/$widgetId",
  getParentRoute: () => shellRoute,
  validateSearch: (search: Record<string, unknown>): { zoom: boolean } => ({
    zoom: search.zoom === true || search.zoom === "true",
  }),
  component: WidgetDetail,
});

function WidgetList() {
  const { widgets } = widgetsRoute.useLoaderData() as { widgets: string[] };
  return (
    <div>
      <h2>Widgets</h2>
      <ul>
        {widgets.map((widget) => (
          <li key={widget}>{widget}</li>
        ))}
      </ul>
    </div>
  );
}

function WidgetDetail() {
  const { widgetId } = widgetDetailRoute.useParams();
  const { zoom } = widgetDetailRoute.useSearch();
  return (
    <div>
      <h2>Widget {widgetId}</h2>
      <p>zoom: {String(zoom)}</p>
    </div>
  );
}

export const codeTree = rootRoute.addChildren([
  shellRoute.addChildren([widgetsRoute, widgetDetailRoute]),
]);
