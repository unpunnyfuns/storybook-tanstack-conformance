import { makeAppConfig } from "../../shared/vite.ts";

// TanStack Start with virtual file routes: the tree structure is declared in
// src/routes.ts.
export default makeAppConfig({
  dirname: import.meta.dirname,
  routing: "virtual",
  start: true,
});
