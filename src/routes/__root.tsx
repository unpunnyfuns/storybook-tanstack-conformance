import { Link, Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { authStore, useAuth } from "../auth";
import type { AuthStore } from "../auth";

export interface RouterContext {
  auth: AuthStore;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: () => (
    <div className="panel">
      <h1>404</h1>
      <p>No route matched.</p>
      <Link to="/">Go home</Link>
    </div>
  ),
});

function RootLayout() {
  return (
    <div className="app">
      <nav className="nav">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/users">Users</Link>
        <Link to="/posts" search={{ tag: "all", page: 1, sort: "newest" }}>
          Posts
        </Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/pricing">Pricing</Link>
        <Link to="/posts/archived">Archived</Link>
        <Link to="/files/$" params={{ _splat: "reports/2026/q2.pdf" }}>
          Files
        </Link>
        <Link to="/boom">Boom</Link>
        <AuthToggle />
      </nav>
      <main className="content">
        <Outlet />
      </main>
      <TanStackRouterDevtools position="bottom-right" />
    </div>
  );
}

function AuthToggle() {
  const authed = useAuth();
  return (
    <button onClick={() => authStore.toggle()} style={{ marginLeft: "auto" }}>
      {authed ? "Log out" : "Log in"}
    </button>
  );
}
