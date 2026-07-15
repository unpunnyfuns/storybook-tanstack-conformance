import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { listPosts, type PostTag } from "../../data";

interface PostsSearch {
  tag: PostTag | "all";
  page: number;
  sort: "newest" | "oldest";
}

const TAGS: Array<PostTag | "all"> = ["all", "news", "guide", "update"];

export const Route = createFileRoute("/posts/")({
  validateSearch: (search: Record<string, unknown>): PostsSearch => {
    const tag = search.tag;
    const sort = search.sort;
    const page = Number(search.page);
    return {
      tag: TAGS.includes(tag as PostTag | "all") ? (tag as PostTag | "all") : "all",
      page: Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1,
      sort: sort === "oldest" ? "oldest" : "newest",
    };
  },
  component: PostsList,
});

function PostsList() {
  const { tag, page, sort } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { items, pageCount, total } = listPosts({ tag, page, pageSize: 5, sort });

  return (
    <div className="panel">
      <h1>Posts</h1>
      <p>Typed search params drive filtering, sorting, and pagination. Total matching: {total}.</p>
      <section className="expected">
        <strong>Expected behavior</strong>
        <ul>
          <li>
            Changing <em>Tag</em> sets <code>?tag=</code> and resets <code>?page=</code> to 1,
            filtering the list.
          </li>
          <li>
            Changing <em>Sort</em> sets <code>?sort=</code> and reorders without resetting the page.
          </li>
          <li>
            <em>Prev</em>/<em>Next</em> change <code>?page=</code> and disable at the bounds.
          </li>
          <li>
            A bad query such as <code>?page=abc</code> or <code>?tag=xyz</code> is coerced to
            defaults by <code>validateSearch</code>.
          </li>
        </ul>
      </section>

      <div className="row">
        <label>
          Tag:{" "}
          <select
            value={tag}
            onChange={(e) =>
              navigate({
                search: (prev) => ({ ...prev, tag: e.target.value as PostsSearch["tag"], page: 1 }),
              })
            }
          >
            {TAGS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label>
          Sort:{" "}
          <select
            value={sort}
            onChange={(e) =>
              navigate({
                search: (prev) => ({ ...prev, sort: e.target.value as PostsSearch["sort"] }),
              })
            }
          >
            <option value="newest">newest</option>
            <option value="oldest">oldest</option>
          </select>
        </label>
      </div>

      <ul>
        {items.map((p) => (
          <li key={p.id}>
            <Link to="/posts/$postId" params={{ postId: p.id }} search={{ highlight: false }}>
              {p.title}
            </Link>{" "}
            <span>
              [{p.tag}]{p.published ? "" : " (draft)"}
            </span>
          </li>
        ))}
      </ul>

      <div className="row">
        <button
          disabled={page <= 1}
          onClick={() => navigate({ search: (prev) => ({ ...prev, page: prev.page - 1 }) })}
        >
          Prev
        </button>
        <span>
          Page {page} / {pageCount}
        </span>
        <button
          disabled={page >= pageCount}
          onClick={() => navigate({ search: (prev) => ({ ...prev, page: prev.page + 1 }) })}
        >
          Next
        </button>
      </div>
    </div>
  );
}
