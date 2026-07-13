import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/boom")({
  loader: () => {
    throw new Error("Intentional error to exercise the error boundary.");
  },
  component: () => <div className="panel">Unreachable — the loader always throws.</div>,
});
