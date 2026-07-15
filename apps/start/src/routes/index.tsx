import { createFileRoute } from "@tanstack/react-router";
import { listItems } from "../server-functions";

export const Route = createFileRoute("/")({
  loader: () => listItems(),
  component: Home,
});

function Home() {
  const items = Route.useLoaderData();
  return (
    <div>
      <h1>Inventory</h1>
      <p>Loaded via a server function in the route loader.</p>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.name}: {item.stock} in stock
          </li>
        ))}
      </ul>
    </div>
  );
}
