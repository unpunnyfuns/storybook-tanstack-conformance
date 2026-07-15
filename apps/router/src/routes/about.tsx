import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: () => (
    <div className="panel">
      <h1>About</h1>
      <p>
        A flat, static file-based route at <code>/about</code>.
      </p>
      <section className="expected">
        <strong>Expected behavior</strong>
        <ul>
          <li>
            Navigating to <code>/about</code> renders this static content — no loader, no params, no
            search.
          </li>
        </ul>
      </section>
    </div>
  ),
});
