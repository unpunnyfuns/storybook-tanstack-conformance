import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings/_tabs")({
  beforeLoad: () => ({ section: "Settings" }),
  component: () => (
    <div className="panel">
      <small>
        Tabs layout <code>/settings/_tabs</code> — pathless, provides context via{" "}
        <code>beforeLoad</code>
      </small>
      <Outlet />
    </div>
  ),
});
