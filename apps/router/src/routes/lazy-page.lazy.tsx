import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/lazy-page")({
  component: LazyPage,
});

function LazyPage() {
  const { source } = Route.useLoaderData();
  return (
    <div className="panel">
      <h2>Lazy page</h2>
      <section className="expected">
        <strong>Expected behavior</strong>
        <ul>
          <li>
            The component lives in <code>lazy-page.lazy.tsx</code> and is paired with the eager
            route file by route id; its loader data comes from the eager file.
          </li>
        </ul>
      </section>
      <p>Loader said: {source}</p>
    </div>
  );
}
