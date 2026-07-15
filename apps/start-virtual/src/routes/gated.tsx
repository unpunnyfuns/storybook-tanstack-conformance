import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_gated")({
  beforeLoad: () => ({ gate: "open" }),
  component: () => (
    <div>
      <p>gated layout (virtual)</p>
      <Outlet />
    </div>
  ),
});
