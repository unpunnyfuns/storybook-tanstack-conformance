import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/lazy-page")({
  loader: () => ({ source: "eager loader" }),
});
