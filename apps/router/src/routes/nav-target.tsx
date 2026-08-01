import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/nav-target")({
  component: () => <h1>Nav target</h1>,
});
