import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin")({
  component: () => (
    <div className="panel">
      <small>
        Admin layout <code>/_admin</code> — a second pathless layout beside <code>/_authed</code>
      </small>
      <Outlet />
    </div>
  ),
});
