import { createFileRoute } from "@tanstack/react-router";

// The index of a root-level pathless layout: file id `/_app/`, URL `/`. The
// generated tree rewrites this to `id: '/', path: '/', getParentRoute: _app`.
export const Route = createFileRoute("/_app/")({
  component: Home,
});

function Home() {
  const { shell } = Route.useRouteContext();
  return (
    <div className="panel">
      <h1>Shell Home</h1>
      <p>
        Inside of: <code>{shell}</code> (from the shell layout&apos;s <code>beforeLoad</code>{" "}
        context)
      </p>
    </div>
  );
}
