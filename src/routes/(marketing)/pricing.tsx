import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(marketing)/pricing")({
  component: Pricing,
});

function Pricing() {
  return (
    <div className="panel">
      <h1>Pricing</h1>
      <section className="expected">
        <strong>Expected behavior</strong>
        <ul>
          <li>
            This file lives in the <code>(marketing)</code> group directory; the group segment never
            appears in the URL, which is plain <code>/pricing</code>.
          </li>
        </ul>
      </section>
      <p>Free forever. It is a repro harness.</p>
    </div>
  );
}
