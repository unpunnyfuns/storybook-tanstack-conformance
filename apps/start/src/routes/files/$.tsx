import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/files/$")({
  component: FileViewer,
});

function FileViewer() {
  const { _splat } = Route.useParams();
  return (
    <div className="panel">
      <h2>File viewer</h2>
      <section className="expected">
        <strong>Expected behavior</strong>
        <ul>
          <li>
            Everything after <code>/files/</code> is captured by the splat param and echoed below.
          </li>
        </ul>
      </section>
      <p>
        Splat path: <code>{_splat}</code>
      </p>
    </div>
  );
}
