import { Link, Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <div>
      <nav>
        <Link to="/">Home</Link> <Link to="/panel">Panel</Link>{" "}
        <Link to="/items/$itemId" params={{ itemId: "1" }}>
          Item 1
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
