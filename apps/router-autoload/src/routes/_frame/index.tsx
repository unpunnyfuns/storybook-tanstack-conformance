import { createFileRoute } from "@tanstack/react-router";

// File id `/_frame/`, URL `/`. Only the generated tree knows that: the file
// route itself carries nothing but its own path until `routeTree.gen` calls
// `.update()` over it with an id, a path and a parent.
export const Route = createFileRoute("/_frame/")({
  component: Home,
});

function Home() {
  const { frame } = Route.useRouteContext();
  return (
    <div className="panel">
      <h1>Autoload Home</h1>
      <p>
        Inside of: <code>{frame}</code> (from the frame layout&apos;s <code>beforeLoad</code>{" "}
        context)
      </p>
    </div>
  );
}
