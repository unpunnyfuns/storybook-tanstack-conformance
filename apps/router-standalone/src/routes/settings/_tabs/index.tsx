import { createFileRoute } from "@tanstack/react-router";

// File id `/settings/_tabs/`, URL `/settings`. The trailing slash in the id is
// what makes this the index of the layout rather than the layout itself.
export const Route = createFileRoute("/settings/_tabs/")({
  component: General,
});

function General() {
  const { section } = Route.useRouteContext();
  return (
    <div className="panel">
      <h1>General</h1>
      <p>
        Tab of: <code>{section}</code>
      </p>
    </div>
  );
}
