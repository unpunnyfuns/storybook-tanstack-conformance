import { createFileRoute } from "@tanstack/react-router";
import type { Item } from "../data";
import { listItems } from "../server-functions";

export const Route = createFileRoute("/")({
  loader: () => listItems(),
  component: Home,
});

function Home() {
  const items = Route.useLoaderData() as Item[];
  return (
    <div>
      <h1>Inventory</h1>
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
