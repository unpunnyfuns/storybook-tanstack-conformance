import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { viewer } = Route.useRouteContext();
  return (
    <div>
      <h1>Dashboard</h1>
      <p>
        Signed in as: <code>{viewer}</code> (from the layout&apos;s <code>beforeLoad</code> context)
      </p>
    </div>
  );
}
