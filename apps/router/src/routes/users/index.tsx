import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { users } from "../../data";

function UsersIndex() {
  const [tracked, setTracked] = useState(0);
  return (
    <>
      <section className="expected">
        <strong>Expected behavior</strong>
        <ul>
          <li>
            Lists all users. Clicking a name navigates to <code>/users/$userId</code> with that id
            as a typed path param.
          </li>
          <li>
            The "Track and open" link carries its own <code>onClick</code>; the mock must run it
            before the navigation spy, just like a real router.
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
      <p>
        <Link
          to="/users/$userId"
          params={{ userId: "1" }}
          onClick={() => setTracked((count) => count + 1)}
          data-testid="tracked-link"
        >
          Track and open Ada
        </Link>
      </p>
      {tracked > 0 && <p data-testid="tracked-count">onClick ran {tracked}x</p>}
    </>
  );
}

export const Route = createFileRoute("/users/")({
  component: UsersIndex,
});
