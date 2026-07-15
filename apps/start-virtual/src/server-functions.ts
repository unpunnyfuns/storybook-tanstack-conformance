import { createServerFn } from "@tanstack/react-start";
import { items } from "./data";

export const listItems = createServerFn({ method: "GET" }).handler(() => items);

export const getItem = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(({ data }) => {
    const item = items.find((candidate) => candidate.id === data);
    if (!item) {
      throw new Error(`No item with id ${data}`);
    }
    return item;
  });
