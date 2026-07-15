import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings/_tabs/")({
  component: General,
});

function General() {
  const { section } = Route.useRouteContext();
  return (
    <div>
      <h2>General</h2>
      <p>
        Tab of: <code>{section}</code> (from the layout&apos;s <code>beforeLoad</code> context)
      </p>
    </div>
  );
}
