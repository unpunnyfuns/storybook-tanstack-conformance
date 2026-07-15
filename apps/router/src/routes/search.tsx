import { createFileRoute } from "@tanstack/react-router";
import { posts } from "../data";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): { q: string } => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: ({ deps }) => ({
    results: posts.filter((post) => post.title.toLowerCase().includes(deps.q.toLowerCase())),
  }),
  component: Search,
});

function Search() {
  const { q } = Route.useSearch();
  const { results } = Route.useLoaderData();
  return (
    <div className="panel">
      <h2>Search</h2>
      <section className="expected">
        <strong>Expected behavior</strong>
        <ul>
          <li>
            The loader depends on the <code>q</code> search param via <code>loaderDeps</code>; the
            result list is computed in the loader, not the component.
          </li>
        </ul>
      </section>
      <p>
        Query: <code>{q || "(empty)"}</code>
      </p>
      <p>Results: {results.length}</p>
    </div>
  );
}
