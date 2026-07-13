import { createFileRoute } from "@tanstack/react-router";
import { posts } from "../../../data";

export const Route = createFileRoute("/posts/_archive/archived")({
  loader: () => ({ archived: posts.filter((post) => !post.published) }),
  component: Archived,
});

function Archived() {
  const { archived } = Route.useLoaderData();
  return (
    <div>
      <h2>Archived posts</h2>
      <section className="expected">
        <strong>Expected behavior</strong>
        <ul>
          <li>
            Served at <code>/posts/archived</code> — the <code>_archive</code> layout segment is
            pathless and nested under the pathful <code>/posts</code> segment.
          </li>
        </ul>
      </section>
      <ul>
        {archived.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
      <p>Total archived: {archived.length}</p>
    </div>
  );
}
