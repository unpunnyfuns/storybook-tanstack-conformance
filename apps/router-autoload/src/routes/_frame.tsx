import { Outlet, createFileRoute } from "@tanstack/react-router";

// A root-level pathless layout owning the whole app. It contributes nothing to
// the URL, so its index child is the site root. Its chrome and its `beforeLoad`
// context are the two things the gauge story looks for: neither can reach a
// child that arrived without a parent.
export const Route = createFileRoute("/_frame")({
  beforeLoad: () => ({ frame: "Autoload Frame" }),
  component: FrameLayout,
});

function FrameLayout() {
  return (
    <div className="app">
      <main className="content">
        <small>
          Frame layout <code>/_frame</code>, pathless, provides context via <code>beforeLoad</code>
        </small>
        <Outlet />
      </main>
    </div>
  );
}
