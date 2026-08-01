import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: () => (
    <div className="panel">
      <h1>CSF Factories Harness</h1>
      <p>Every story in this app is written with `preview.meta()` and `meta.story()`.</p>
    </div>
  ),
});
