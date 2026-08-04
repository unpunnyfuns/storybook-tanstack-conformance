import { Link, Outlet, createRootRoute } from "@tanstack/react-router";

// Deliberately tiny, like router-autoload. This app measures one thing: what a
// file route does when Storybook never connects the generated tree. Extra
// routes would only add ways for a story to fail for an unrelated reason.
//
// The 404 component matters here. A story that matches nothing renders this,
// so it is the visible difference between "the URL matched" and "the URL did
// not", which is exactly what the gauges below are asking.
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
