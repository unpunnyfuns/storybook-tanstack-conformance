import { index, layout, rootRoute, route } from "@tanstack/virtual-file-routes";

export const routes = rootRoute("root.tsx", [
  index("home.tsx"),
  layout("gated", "gated.tsx", [route("/panel", "panel.tsx")]),
  route("/items/$itemId", "item.tsx"),
]);
