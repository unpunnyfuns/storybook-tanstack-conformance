import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";

/**
 * A server fn that redirects back to this route with a search flag. The real
 * useServerFn catches the thrown redirect and navigates; the page re-renders
 * with done=yes. Self-referential so the gauge needs no other route.
 */
const login = createServerFn({ method: "POST" }).handler(() => {
  throw redirect({ to: "/redirector", search: { done: "yes" } });
});

export const Route = createFileRoute("/redirector")({
  validateSearch: (search: Record<string, unknown>) => ({
    done: typeof search.done === "string" ? search.done : "no",
  }),
  component: RedirectorPage,
});

function RedirectorPage() {
  const { done } = Route.useSearch();
  const run = useServerFn(login);
  return (
    <main>
      <h1>Redirector</h1>
      <p>done: {done}</p>
      <button type="button" onClick={() => void run({})}>
        log in
      </button>
    </main>
  );
}
