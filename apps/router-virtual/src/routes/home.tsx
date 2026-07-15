import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: () => (
    <div>
      <h1>Virtual routes</h1>
      <p>The tree structure lives in src/routes.ts; this file only implements the route.</p>
    </div>
  ),
});
