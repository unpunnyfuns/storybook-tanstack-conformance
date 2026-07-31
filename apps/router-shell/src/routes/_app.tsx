import { Link, Outlet, createFileRoute } from "@tanstack/react-router";

// The app shell: a root-level pathless layout that owns every page the user
// sees. It contributes nothing to the URL, so its index child is the site root
// (`/`) rather than a nested path.
export const Route = createFileRoute("/_app")({
  beforeLoad: () => ({ shell: "App Shell" }),
  component: AppShell,
});

function AppShell() {
  return (
    <div className="app">
      <nav className="nav">
        <Link to="/">Home</Link>
        <Link to="/settings">Settings</Link>
        <Link to="/login">Log in</Link>
      </nav>
      <main className="content">
        <small>
          Shell layout <code>/_app</code> — pathless, provides context via <code>beforeLoad</code>
        </small>
        <Outlet />
      </main>
    </div>
  );
}
