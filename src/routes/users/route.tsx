import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/users")({
  component: () => (
    <div className="panel">
      <h1>Users</h1>
      <p>
        A layout route: renders a heading and a nested <code>&lt;Outlet /&gt;</code>.
      </p>
      <section className="expected">
        <strong>Expected behavior</strong>
        <ul>
          <li>
            This heading stays mounted while the <code>&lt;Outlet /&gt;</code> below swaps between
            the list (<code>/users</code>) and a detail (<code>/users/$userId</code>).
          </li>
        </ul>
      </section>
      <Outlet />
    </div>
  ),
});
