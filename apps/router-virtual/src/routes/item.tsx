import { createFileRoute } from "@tanstack/react-router";
import { items } from "../data";

export const Route = createFileRoute("/items/$itemId")({
  loader: ({ params }) => {
    const item = items.find((candidate) => candidate.id === params.itemId);
    if (!item) {
      throw new Error(`No item with id ${params.itemId}`);
    }
    return { item };
  },
  component: ItemDetail,
});

function ItemDetail() {
  const { item } = Route.useLoaderData();
  return (
    <div>
      <h1>{item.name}</h1>
      <p>stock: {item.stock}</p>
    </div>
  );
}
