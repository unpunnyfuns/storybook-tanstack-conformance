import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/posts/$postId")({
  component: () => (
    <div className="panel">
      <small>
        Nested layout under <code>/posts/$postId</code>
      </small>
      <Outlet />
    </div>
  ),
});
