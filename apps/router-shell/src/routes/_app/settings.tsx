import { createFileRoute } from "@tanstack/react-router";

// A pathful sibling under the same shell: the control for the index above. Its
// file id carries a path, so it never reaches the id-preservation branch that
// the index collides on.
export const Route = createFileRoute("/_app/settings")({
  component: Settings,
});

function Settings() {
  const { shell } = Route.useRouteContext();
  return (
    <div className="panel">
      <h1>Settings</h1>
      <p>
        Inside of: <code>{shell}</code> (from the shell layout&apos;s <code>beforeLoad</code>{" "}
        context)
      </p>
    </div>
  );
}
