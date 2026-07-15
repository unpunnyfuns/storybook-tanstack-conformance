import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/audit")({
  component: () => (
    <div>
      <h2>Audit log</h2>
      <p>
        Served at <code>/audit</code> under the <code>_admin</code> pathless layout.
      </p>
    </div>
  ),
});
