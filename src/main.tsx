import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { authStore } from "./auth";
import "./index.css";
import { routeTree } from "./routeTree.gen";

const router = createRouter({
  routeTree,
  context: { auth: authStore },
  defaultPendingComponent: () => <div className="panel">Loading…</div>,
  defaultErrorComponent: ({ error }) => (
    <div className="panel">
      <h2>Something broke</h2>
      <pre>{error.message}</pre>
    </div>
  ),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.querySelector("#root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
