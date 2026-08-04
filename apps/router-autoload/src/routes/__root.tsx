import { Link, Outlet, createRootRoute } from "@tanstack/react-router";

// Deliberately tiny. This app exists to measure one thing: whether the
// framework finds and runs `routeTree.gen.ts` on its own. Every extra route
// would be another way for a story to fail for an unrelated reason.
export const Route = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: () => (
    <div className="panel">
      <h1>404</h1>
      <p>No route matched.</p>
      <Link to="/">Go home</Link>
    </div>
  ),
});
