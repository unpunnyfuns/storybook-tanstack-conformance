import { Link, Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
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
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/users/$userId" params={{ userId: "1" }}>
          Ada
        </Link>
      </nav>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
