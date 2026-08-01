import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: () => (
    <div className="panel">
      <h1>About</h1>
      <p>A flat route with nothing special about it.</p>
    </div>
  ),
});
