import { createFileRoute } from "@tanstack/react-router";

const users: Record<string, string> = {
  "1": "Ada Lovelace",
  "2": "Grace Hopper",
};

export const Route = createFileRoute("/users/$userId")({
  loader: ({ params }) => ({ name: users[params.userId] ?? "Unknown" }),
  component: User,
});

function User() {
  const { name } = Route.useLoaderData();
  const { userId } = Route.useParams();
  return (
    <div className="panel">
      <h1>{name}</h1>
      <p>
        Loaded from the route loader for id <code>{userId}</code>.
      </p>
    </div>
  );
}
