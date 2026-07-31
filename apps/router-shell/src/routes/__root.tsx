import { Link, Outlet, createRootRoute } from "@tanstack/react-router";

// This app has no `src/routes/index.tsx`. The site root is owned by the shell's
// index (`_app/index.tsx`), which is the whole point of the app: a root-level
// pathless layout cannot be given a sibling index without a URL collision.
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
