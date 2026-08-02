import { makeAppConfig } from "../../shared/vite.ts";

// Virtual file routes: the tree structure is declared in src/routes.ts, the
// implementations live in src/routes/.
export default makeAppConfig({
  dirname: import.meta.dirname,
  routing: "virtual",
});
