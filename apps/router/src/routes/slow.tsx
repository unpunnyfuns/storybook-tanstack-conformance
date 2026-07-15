import { createFileRoute } from "@tanstack/react-router";

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export const Route = createFileRoute("/slow")({
  pendingMs: 0,
  pendingMinMs: 0,
  loader: async () => {
    await delay(250);
    return { answer: 42 };
  },
  pendingComponent: () => <p>Loading slowly…</p>,
  component: Slow,
});

function Slow() {
  const { answer } = Route.useLoaderData();
  return (
    <div className="panel">
      <h2>Slow route</h2>
      <section className="expected">
        <strong>Expected behavior</strong>
        <ul>
          <li>
            The loader takes 250ms; the route-level <code>pendingComponent</code> shows first, then
            this content.
          </li>
        </ul>
      </section>
      <p>Answer: {answer}</p>
    </div>
  );
}
