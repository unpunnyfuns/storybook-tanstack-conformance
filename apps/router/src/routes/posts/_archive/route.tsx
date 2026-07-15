import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/posts/_archive")({
  component: () => (
    <div className="panel">
      <small>
        Nested pathless layout <code>/posts/_archive</code> — invisible in the URL
      </small>
      <Outlet />
    </div>
  ),
});
