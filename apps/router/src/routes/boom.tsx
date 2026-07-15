import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/boom")({
  loader: () => {
    throw new Error("Intentional error to exercise the error boundary.");
  },
  errorComponent: ({ error }) => (
    <div className="panel">
      <h2>Boom boundary</h2>
      <p>Route-level errorComponent caught: {error.message}</p>
    </div>
  ),
  component: () => <div className="panel">Unreachable — the loader always throws.</div>,
});
