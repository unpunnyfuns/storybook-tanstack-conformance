import { Outlet, createFileRoute } from "@tanstack/react-router";

// A pathless layout under a pathful ancestor. It contributes nothing to the
// URL, so its index child is reached at `/settings`, and, as the real app
// proves, at `/settings/` too.
export const Route = createFileRoute("/settings/_tabs")({
  beforeLoad: () => ({ section: "Settings" }),
  component: TabsLayout,
});

function TabsLayout() {
  return (
    <div className="app">
      <main className="content">
        <small>
          Tabs layout <code>/settings/_tabs</code>, pathless, provides context via{" "}
          <code>beforeLoad</code>
        </small>
        <Outlet />
      </main>
    </div>
  );
}
