import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { redirectedFrom?: string } => ({
    redirectedFrom: typeof search.redirectedFrom === "string" ? search.redirectedFrom : undefined,
  }),
  component: Home,
});

function Home() {
  const { redirectedFrom } = Route.useSearch();
  return (
    <div className="panel">
      <h1>TanStack Router Repro Harness</h1>
      {redirectedFrom && (
        <p className="row">
          Redirected here from <code>{redirectedFrom}</code> by the auth guard.
        </p>
      )}
      <p>Each link exercises a distinct router feature.</p>
      <section className="expected">
        <strong>How to use this harness</strong>
        <ul>
          <li>
            Every link below isolates one router feature in its own file under{" "}
            <code>src/routes/</code>.
          </li>
          <li>
            Open a route, read its <em>Expected behavior</em> note, confirm it matches, then mutate
            that one file to reproduce your issue.
          </li>
          <li>
            Use the <em>Log in / Log out</em> toggle (top of the nav) to exercise the auth guard.
          </li>
          <li>
            <code>npm run build</code> type-checks every route against the generated tree — your
            fastest correctness signal.
          </li>
        </ul>
      </section>
      <ul>
        <li>
          <Link to="/about">Flat route</Link>
        </li>
        <li>
          <Link to="/users">Layout route + dynamic params</Link>
        </li>
        <li>
          <Link to="/posts" search={{ tag: "all", page: 1, sort: "newest" }}>
            Search params: filters + pagination
          </Link>
        </li>
        <li>
          <Link to="/dashboard">Guarded route (beforeLoad + context)</Link>
        </li>
        <li>
          <Link to="/boom">Error boundary (route throws)</Link>
        </li>
      </ul>
    </div>
  );
}
