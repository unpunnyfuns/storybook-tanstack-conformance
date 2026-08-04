import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="panel">
      <h1>Standalone Home</h1>
      <p>
        This app never connects <code>routeTree.gen</code> to Storybook, so its file routes reach a
        story carrying nothing but their own path.
      </p>
    </div>
  );
}
