import { createFileRoute } from "@tanstack/react-router";
import { getItem } from "../server-functions";

export const Route = createFileRoute("/items/$itemId")({
  loader: ({ params }) => getItem({ data: params.itemId }),
  component: ItemDetail,
});

function ItemDetail() {
  const item = Route.useLoaderData();
  return (
    <div>
      <h1>{item.name}</h1>
      <p>Stock: {item.stock}</p>
    </div>
  );
}
