import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { auth } = Route.useRouteContext();
  return (
    <div className="panel">
      <h1>Dashboard</h1>
      <section className="expected">
        <strong>Expected behavior</strong>
        <ul>
          <li>
            Logged out: <code>beforeLoad</code> throws <code>redirect</code> — you never reach this
            page, and Home shows where you came from.
          </li>
          <li>
            Logged in: this renders and reads <code>auth</code> from the route context (shown
            below).
          </li>
        </ul>
      </section>
      <p>
        Protected route. Reached only because <code>beforeLoad</code> passed.
      </p>
      <p>Authenticated (from route context): {String(auth.isAuthenticated())}</p>
    </div>
  );
}
