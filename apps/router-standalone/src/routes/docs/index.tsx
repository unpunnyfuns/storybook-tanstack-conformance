import { createFileRoute } from "@tanstack/react-router";

// A plain nested index, no pathless layout anywhere near it. The framework's
// own note claims `settings/index.tsx` behaves the same as the layout index
// above, so this route exists to hold that claim to a measurement rather than
// leaving it as an assertion in a comment.
export const Route = createFileRoute("/docs/")({
  component: DocsIndex,
});

function DocsIndex() {
  return (
    <div className="panel">
      <h1>Docs Index</h1>
      <p>A plain nested index, with no pathless layout involved.</p>
    </div>
  );
}
