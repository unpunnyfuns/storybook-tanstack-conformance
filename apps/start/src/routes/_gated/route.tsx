import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_gated")({
  beforeLoad: () => ({ gate: "open" }),
  component: () => (
    <div>
      <small>Gated layout (pathless)</small>
      <Outlet />
    </div>
  ),
});
