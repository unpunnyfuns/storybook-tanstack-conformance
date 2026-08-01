import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed")({
  beforeLoad: () => ({ viewer: "Ada Lovelace" }),
  component: () => (
    <div className="panel">
      <small>
        Authed layout <code>/_authed</code> — pathless, provides context via <code>beforeLoad</code>
      </small>
      <Outlet />
    </div>
  ),
});
