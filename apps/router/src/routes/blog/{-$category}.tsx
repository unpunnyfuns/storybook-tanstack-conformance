import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/blog/{-$category}")({
  component: Blog,
});

function Blog() {
  const { category } = Route.useParams();
  return (
    <div className="panel">
      <h2>Blog</h2>
      <section className="expected">
        <strong>Expected behavior</strong>
        <ul>
          <li>
            The <code>category</code> param is optional: <code>/blog</code> and{" "}
            <code>/blog/guides</code> both match this route.
          </li>
        </ul>
      </section>
      <p>Category: {category ?? "all"}</p>
    </div>
  );
}
