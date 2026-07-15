import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { getPost } from "../../../data";

export const Route = createFileRoute("/posts/$postId/")({
  validateSearch: (search: Record<string, unknown>): { highlight: boolean } => ({
    highlight: search.highlight === true || search.highlight === "true",
  }),
  loader: async ({ params }) => {
    const post = await getPost(params.postId);
    if (!post) throw notFound();
    return { post };
  },
  component: PostDetail,
});

function PostDetail() {
  const { post } = Route.useLoaderData();
  const { highlight } = Route.useSearch();
  return (
    <div className="panel">
      <h2 style={highlight ? { background: "yellow", color: "black" } : undefined}>{post.title}</h2>
      <section className="expected">
        <strong>Expected behavior</strong>
        <ul>
          <li>
            The <code>loader</code> fetches this post by its <code>postId</code> param (a missing id
            throws <code>notFound()</code>).
          </li>
          <li>
            <em>Toggle highlight</em> flips its own <code>?highlight=</code> search param; the title
            background reflects it.
          </li>
        </ul>
      </section>
      <p>{post.body}</p>
      <p>Tag: {post.tag}</p>
      <div className="row">
        <Link to="/posts/$postId" params={{ postId: post.id }} search={{ highlight: !highlight }}>
          Toggle highlight (search param)
        </Link>
        <Link to="/posts" search={{ tag: "all", page: 1, sort: "newest" }}>
          Back to posts
        </Link>
      </div>
    </div>
  );
}
