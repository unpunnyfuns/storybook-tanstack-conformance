import { Link, createFileRoute } from "@tanstack/react-router";
import { users } from "../../data";

export const Route = createFileRoute("/users/")({
  component: () => (
    <>
      <section className="expected">
        <strong>Expected behavior</strong>
        <ul>
          <li>
            Lists all users. Clicking a name navigates to <code>/users/$userId</code> with that id
            as a typed path param.
          </li>
        </ul>
      </section>
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            <Link to="/users/$userId" params={{ userId: u.id }}>
              {u.name}
            </Link>{" "}
            <span>({u.role})</span>
          </li>
        ))}
      </ul>
    </>
  ),
});
