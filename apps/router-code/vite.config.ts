import { makeAppConfig } from "../../shared/vite";

// Code-based routing: no router plugin, no generated route tree. The whole
// router is configured in src/router.tsx with createRoute().
export default makeAppConfig({
  dirname: import.meta.dirname,
  routing: "code",
});
