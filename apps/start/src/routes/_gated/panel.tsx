import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_gated/panel")({
  component: Panel,
});

function Panel() {
  const { gate } = Route.useRouteContext();
  return (
    <div>
      <h1>Panel</h1>
      <p>
        Served at <code>/panel</code> under the pathless <code>_gated</code> layout. Gate is {gate}.
      </p>
    </div>
  );
}
