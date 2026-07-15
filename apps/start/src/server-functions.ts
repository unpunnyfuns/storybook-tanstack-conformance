import { createServerFn } from "@tanstack/react-start";
import { items } from "./data";
import { db } from "./db/client";

export const listItems = createServerFn({ method: "GET" }).handler(async () => {
  await db.query("select * from items");
  return items;
});

export const getItem = createServerFn({ method: "GET" })
  .inputValidator((id: string) => id)
  .handler(async ({ data }) => {
    await db.query("select * from items where id = $1");
    const item = items.find((candidate) => candidate.id === data);
    if (!item) {
      throw new Error(`No item with id ${data}`);
    }
    return item;
  });
