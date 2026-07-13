import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { getUser } from "../../data";

export const Route = createFileRoute("/users/$userId")({
  loader: async ({ params }) => {
    const user = await getUser(params.userId);
    if (!user) throw notFound();
    return { user };
  },
  component: UserDetail,
});

function UserDetail() {
  const { user } = Route.useLoaderData();
  const { userId } = Route.useParams();
  return (
    <div className="panel">
      <h2>{user.name}</h2>
      <section className="expected">
        <strong>Expected behavior</strong>
        <ul>
          <li>
            The <code>loader</code> runs before render — you briefly see the <em>Loading…</em>{" "}
            pending component, then this data.
          </li>
          <li>
            The <code>userId</code> segment of the URL is read as a typed param and shown below.
          </li>
          <li>
            A missing id such as <code>/users/999</code> throws <code>notFound()</code> → the 404
            panel.
          </li>
        </ul>
      </section>
      <p>
        Param <code>userId</code> = <code>{userId}</code>
      </p>
      <p>
        {user.email} — {user.role}
      </p>
      <Link to="/users">Back to list</Link>
    </div>
  );
}
